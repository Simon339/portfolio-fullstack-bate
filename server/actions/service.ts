"use server";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServiceSchema, CreateQuotationSchema } from "@/types";
import * as z from "zod";
import { db } from "../db";
import { sendServiceInquiryConfirmationEmail } from "@/lib/mail";
import { auditLogs, serviceInquiries, quotationItems } from "../schema";
import { headers } from "next/headers";
import { desc, eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { auth } from "../auth";

// Add this function to generate a unique quotation number
let quotationCounter = 2784; // starts from 002784

export async function generateQuotationNumber(): Promise<string> {
  quotationCounter += 1;

  const unique = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${quotationCounter.toString().padStart(6, "0")}${unique}`;
}

export async function serviceAction(data: z.infer<typeof ServiceSchema>) {
  try {
    // Validate input data
    ServiceSchema.parse(data);

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Generate a unique quotation number
    const quotationNumber = await generateQuotationNumber();

    // Create a new service inquiry with address
    const [newServiceInquiry] = await db.insert(serviceInquiries).values({
      id: uuidv4(),
      companyName: data.companyName,
      name: data.name,
      service: data.service,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      quotationNumber: quotationNumber,
      createdAt: new Date(),
      read: false,
    })

    const createdId = newServiceInquiry?.id || uuidv4();

    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "service_inquiries",
      timestamp: new Date(),
      recordId: createdId,
      details: JSON.stringify({
        action: "Service inquiry submitted",
        data: {
          id: createdId,
          name: data.name,
          email: data.email,
          service: data.service,
          companyName: data.companyName,
          address: data.address,
          quotationNumber: quotationNumber,
        },
      }),
      ipAddress,
      userAgent,
    });

    // Send confirmation email
    await sendServiceInquiryConfirmationEmail(
      data.name,
      data.companyName,
      data.service,
      data.email,
      data.phoneNumber,
    );

    return { success: "Your message has been successfully sent!" };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

// Server action to create a new quotation
export async function createNewQuotation(
  data: z.infer<typeof CreateQuotationSchema>,
) {
  try {
    // Validate input data
    const validatedData = CreateQuotationSchema.parse(data);

    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["create"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to create" };
    }

    // Generate quotation number
    const quotationNumber = await generateQuotationNumber();

    // Calculate subtotal from items (backend validation)
    const calculatedSubtotal = validatedData.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total) || 0;
      return sum + itemTotal;
    }, 0);

    // Calculate tax and total
    const taxRate = parseFloat(validatedData.taxRate) || 15;
    const tax = calculatedSubtotal * (taxRate / 100);
    const calculatedTotal = calculatedSubtotal + tax;

    // Format address as a string from the address object
    let addressString = "";
    if (validatedData.address) {
      const addressParts = [
        validatedData.address.unit,
        validatedData.address.street,
        validatedData.address.subdivision,
        validatedData.address.city,
        validatedData.address.province,
        validatedData.address.postalCode,
      ].filter(Boolean);
      addressString = addressParts.join(", ");
    }

    // Create service inquiry (quotation)
    const quotationId = uuidv4();

    await db.insert(serviceInquiries).values({
      id: quotationId,
      name: validatedData.name || "",
      companyName: validatedData.companyName || "",
      service: validatedData.service,
      email: validatedData.email,
      phoneNumber: validatedData.phone,
      address: addressString || null, // Convert address object to string
      quotationNumber: quotationNumber,
      subtotal: calculatedSubtotal.toFixed(2),
      taxRate: taxRate.toFixed(2),
      total: calculatedTotal.toFixed(2),
      notes: validatedData.notes || null,
      terms: validatedData.terms || null,
      read: true,
    });

    // Rest of the function remains the same...
    // Create quotation items
    for (const item of validatedData.items) {
      await db.insert(quotationItems).values({
        id: uuidv4(),
        quotationId: quotationId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
        createdAt: new Date(),
      });
    }

    // Log the action
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "service_inquiries",
      timestamp: new Date(),
      recordId: quotationId,
      userId: session.user.id,
      details: JSON.stringify({
        action: "Quotation created",
        data: {
          id: quotationId,
          quotationNumber: quotationNumber,
          companyName: validatedData.companyName,
          email: validatedData.email,
          address: addressString,
          subtotal: calculatedSubtotal.toFixed(2),
          total: calculatedTotal.toFixed(2),
          itemsCount: validatedData.items.length,
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    // Revalidate paths
    revalidatePath(`/dashboard/mails/inquiries/${quotationId}`);

    return {
      success: true,
      quotationId: quotationId,
      quotationNumber: quotationNumber,
      message: "Quotation created successfully",
      redirect: `/dashboard/mails/inquiries/${quotationId}`,
    };
  } catch (error) {

    if (error instanceof z.ZodError) {
      throw new Error(
        `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      );
    }

    throw error instanceof Error
      ? error
      : new Error("Failed to create quotation");
  }
}
export async function getAllServiceInquiry() {
  const inquiries = await db
    .select({
      id: serviceInquiries.id,
      name: serviceInquiries.name,
      email: serviceInquiries.email,
      companyName: serviceInquiries.companyName,
      quotationNumber: serviceInquiries.quotationNumber,
      phoneNumber: serviceInquiries.phoneNumber,
      address: serviceInquiries.address,
      service: serviceInquiries.service,
      subtotal: serviceInquiries.subtotal,
      taxRate: serviceInquiries.taxRate,
      total: serviceInquiries.total,
      notes: serviceInquiries.notes,
      terms: serviceInquiries.terms,
      read: serviceInquiries.read,
      createdAt: serviceInquiries.createdAt,
    })
    .from(serviceInquiries)
    .orderBy(desc(serviceInquiries.createdAt));
  return inquiries;
}

export async function ServiceInquiryQuotationItems(serviceInquiryId: string) {
  try {
    const quotationItemsData = await db
      .select({
        id: quotationItems.id,
        description: quotationItems.description,
        quantity: quotationItems.quantity,
        unit: quotationItems.unit,
        unitPrice: quotationItems.unitPrice,
        total: quotationItems.total,
        createdAt: quotationItems.createdAt,
      })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, serviceInquiryId));

    return quotationItemsData;
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

// Server action to delete a quotation with its items
export async function deleteQuotation(quotationId: string) {
  try {
    // Validate input
    if (!quotationId || typeof quotationId !== "string") {
      throw new Error("Invalid quotation ID");
    }

    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["delete"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to delete" };
    }

    // First, get the quotation details for audit log
    const [quotation] = await db
      .select()
      .from(serviceInquiries)
      .where(eq(serviceInquiries.id, quotationId))
      .limit(1);

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Delete related quotation items first (due to foreign key constraints)
    await db
      .delete(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));

    // Delete the service inquiry
    await db
      .delete(serviceInquiries)
      .where(eq(serviceInquiries.id, quotationId));

    // Log the action
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "service_inquiries",
      recordId: quotationId,
      timestamp: new Date(),
      userId: session.user.id,
      details: JSON.stringify({
        action: "Quotation deleted with all items",
        data: {
          id: quotationId,
          quotationNumber: quotation.quotationNumber,
          companyName: quotation.companyName,
          email: quotation.email,
          deletedAt: new Date().toISOString(),
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    // Revalidate paths
    revalidatePath("/dashboard/mails/inquiries");
    revalidatePath(`/dashboard/mails/inquiries/${quotationId}`);

    return {
      success: true,
      message: `Quotation ${quotation.quotationNumber} and associated items deleted successfully`,
      redirect: "/dashboard/mails/inquiries",
    };
  } catch (error) {
    // Handle foreign key constraint errors
    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      throw new Error(
        "Cannot delete quotation because it's referenced by other records",
      );
    }

    throw error instanceof Error
      ? error
      : new Error("Failed to delete quotation");
  }
}

// Schema for adding/editing quotation items WITH tax rate
const QuotationItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.union([
    z.number().positive("Quantity must be positive"),
    z.string().min(1, "Quantity is required").transform((val) => parseFloat(val))
  ]),
  unit: z.string().min(1, "Unit is required"),
  unitPrice: z.union([
    z.number().positive("Unit price must be positive"),
    z.string().min(1, "Unit price is required").transform((val) => parseFloat(val))
  ]),
})

// Schema for updating quotation details (now includes tax rate in item operations)
const QuotationDetailsSchema = z.object({
  serviceInquiryId: z.string().min(1, "Service inquiry ID is required"),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

// Combined schema for updating items AND tax rate together
const UpdateQuotationWithTaxSchema = z.object({
  serviceInquiryId: z.string().min(1, "Service inquiry ID is required"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").optional(),
  items: z.array(QuotationItemSchema).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export async function addOrEditQuotationItem(
  data: z.infer<typeof QuotationItemSchema>, 
  serviceInquiryId: string,
  taxRate?: number,
) {
  try {
    // Validate input data
    const validatedData = QuotationItemSchema.parse(data)

    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return { error: "Unauthorized!" };
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["update", "create"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to update or create" };
    }

    // Calculate item total with proper type conversion
    const quantity =
      typeof validatedData.quantity === "string"
        ? parseFloat(validatedData.quantity)
        : validatedData.quantity;

    const unitPrice =
      typeof validatedData.unitPrice === "string"
        ? parseFloat(validatedData.unitPrice)
        : validatedData.unitPrice;

    const itemTotal = (quantity * unitPrice).toFixed(2);

    let actionType = "CREATE";
    let recordId: string;

    if (validatedData.id) {
      // Update existing quotation item
      actionType = "UPDATE";
      recordId = validatedData.id;

      await db
        .update(quotationItems)
        .set({
          description: validatedData.description,
          quantity: quantity,
          unit: validatedData.unit,
          unitPrice: unitPrice.toFixed(2),
          total: itemTotal,
        })
        .where(
          and(
            eq(quotationItems.id, validatedData.id),
            eq(quotationItems.quotationId, serviceInquiryId),
          ),
        );
    } else {
      // Create new quotation item
      recordId = uuidv4();
      actionType = "CREATE";

      await db.insert(quotationItems).values({
        id: recordId,
        quotationId: serviceInquiryId,
        description: validatedData.description,
        quantity: quantity,
        unit: validatedData.unit,
        unitPrice: unitPrice.toFixed(2),
        total: itemTotal,
        createdAt: new Date(),
      });
    }

    // Log the action
    await db.insert(auditLogs).values({
      action: actionType,
      tableName: "quotation_items",
      recordId: recordId,
      timestamp: new Date(),
      userId: session.user.id,
      details: JSON.stringify({
        action:
          actionType === "CREATE"
            ? "Quotation item added"
            : "Quotation item updated",
        data: {
          id: recordId,
          serviceInquiryId,
          description: validatedData.description,
          quantity: quantity,
          unit: validatedData.unit,
          unitPrice: unitPrice,
          total: parseFloat(itemTotal),
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    // Recalculate subtotal and total for the service inquiry WITH optional tax rate
    await recalculateQuotationTotals(serviceInquiryId, taxRate);

    revalidatePath("/admin/service-inquiries");
    revalidatePath(`/admin/service-inquiries/${serviceInquiryId}`);

    return {
      success:
        actionType === "CREATE"
          ? "Quotation item added successfully"
          : "Quotation item updated successfully",
    };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

// New function to update items and tax rate together
export async function updateQuotationWithItemsAndTax(
  data: z.infer<typeof UpdateQuotationWithTaxSchema>,
) {
  try {
    // Validate input data
    const validatedData = UpdateQuotationWithTaxSchema.parse(data);
    
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return { error: "Unauthorized!" };
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["update"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to update" };
    }

    // Update tax rate if provided
    if (validatedData.taxRate !== undefined) {
      await db
        .update(serviceInquiries)
        .set({
          taxRate: validatedData.taxRate.toFixed(2),
          notes:
            validatedData.notes !== undefined ? validatedData.notes : undefined,
          terms:
            validatedData.terms !== undefined ? validatedData.terms : undefined,
        })
        .where(eq(serviceInquiries.id, validatedData.serviceInquiryId));
    } else {
      // Update notes and terms even if tax rate not provided
      if (validatedData.notes !== undefined || validatedData.terms !== undefined) {
        await db
          .update(serviceInquiries)
          .set({
            notes:
              validatedData.notes !== undefined ? validatedData.notes : undefined,
            terms:
              validatedData.terms !== undefined ? validatedData.terms : undefined,
          })
          .where(eq(serviceInquiries.id, validatedData.serviceInquiryId));
      }
    }

    // Process items if provided
    if (validatedData.items && validatedData.items.length > 0) {
      // Clear existing items first if we're updating all items
      await db
        .delete(quotationItems)
        .where(eq(quotationItems.quotationId, validatedData.serviceInquiryId));

      // Insert new items
      for (const item of validatedData.items) {
        const quantity =
          typeof item.quantity === "string"
            ? parseFloat(item.quantity)
            : item.quantity;
        const unitPrice =
          typeof item.unitPrice === "string"
            ? parseFloat(item.unitPrice)
            : item.unitPrice;
        const itemTotal = (quantity * unitPrice).toFixed(2);

        await db.insert(quotationItems).values({
          id: uuidv4(),
          quotationId: validatedData.serviceInquiryId,
          description: item.description,
          quantity: quantity,
          unit: item.unit,
          unitPrice: unitPrice.toFixed(2),
          total: itemTotal,
          createdAt: new Date(),
        });
      }
    }

    // Recalculate subtotal and total with new tax rate
    const result = await recalculateQuotationTotals(
      validatedData.serviceInquiryId,
      validatedData.taxRate,
    );

    // Log the action
    await db.insert(auditLogs).values({
      action: "UPDATE",
      timestamp: new Date(),
      tableName: "service_inquiries",
      recordId: validatedData.serviceInquiryId,
      userId: session.user.id,
      details: JSON.stringify({
        action: "Quotation updated with items and tax rate",
        data: {
          serviceInquiryId: validatedData.serviceInquiryId,
          taxRate: validatedData.taxRate,
          itemsCount: validatedData.items?.length || 0,
          subtotal: result.subtotal,
          total: result.total,
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    revalidatePath("/admin/service-inquiries");
    revalidatePath(
      `/admin/service-inquiries/${validatedData.serviceInquiryId}`,
    );

    return {
      success: "Quotation updated successfully",
      data: {
        subtotal: result.subtotal,
        taxRate: result.taxRate,
        total: result.total,
      },
    };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function deleteQuotationItem(
  itemId: string,
  serviceInquiryId: string,
) {
  try {
    
    
    
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return { error: "Unauthorized!" };
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["delete"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to delete" };
    }

    // Get item details before deletion for audit log
    const [itemToDelete] = await db
      .select()
      .from(quotationItems)
      .where(
        and(
          eq(quotationItems.id, itemId),
          eq(quotationItems.quotationId, serviceInquiryId),
        ),
      )
      .limit(1);

    if (!itemToDelete) {
      return { error: "Quotation item not found" };
    }

    await db
      .delete(quotationItems)
      .where(
        and(
          eq(quotationItems.id, itemId),
          eq(quotationItems.quotationId, serviceInquiryId),
        ),
      );

    // Log the action
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "quotation_items",
      recordId: itemId,
      timestamp: new Date(),
      userId: session.user.id,
      details: JSON.stringify({
        action: "Quotation item deleted",
        data: {
          id: itemId,
          serviceInquiryId,
          description: itemToDelete.description,
          quantity: itemToDelete.quantity,
          unitPrice: itemToDelete.unitPrice,
          total: itemToDelete.total,
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    // Recalculate subtotal and total for the service inquiry
    await recalculateQuotationTotals(serviceInquiryId);

    revalidatePath("/admin/service-inquiries");
    revalidatePath(`/admin/service-inquiries/${serviceInquiryId}`);

    return { success: "Quotation item deleted successfully" };
  } catch (error) {
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function updateQuotationDetails(
  data: z.infer<typeof QuotationDetailsSchema>,
) {
  try {
    // Validate input data
    const validatedData = QuotationDetailsSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return { error: "Unauthorized!" };
    }

    // Check if user has permission to issue 
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: session.user.id,
        permissions: {
          project: ["update"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to update" };
    }

    // Update tax rate and other details, then recalculate total
    const result = await recalculateQuotationTotals(
      validatedData.serviceInquiryId,
      validatedData.taxRate,
    );

    // Update notes and terms if provided
    if (
      validatedData.notes !== undefined ||
      validatedData.terms !== undefined
    ) {
      await db
        .update(serviceInquiries)
        .set({
          notes:
            validatedData.notes !== undefined ? validatedData.notes : undefined,
          terms:
            validatedData.terms !== undefined ? validatedData.terms : undefined,
        })
        .where(eq(serviceInquiries.id, validatedData.serviceInquiryId));
    }

    // Log the action
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "service_inquiries",
      recordId: validatedData.serviceInquiryId,
      userId: session.user.id,
      timestamp: new Date(),
      details: JSON.stringify({
        action: "Quotation details updated",
        data: {
          serviceInquiryId: validatedData.serviceInquiryId,
          taxRate: validatedData.taxRate,
          notes: validatedData.notes,
          terms: validatedData.terms,
          subtotal: result.subtotal,
          total: result.total,
        },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    revalidatePath("/admin/service-inquiries");
    revalidatePath(
      `/admin/service-inquiries/${validatedData.serviceInquiryId}`,
    );

    return {
      success: "Quotation details updated successfully",
      data: {
        subtotal: result.subtotal,
        taxRate: result.taxRate,
        total: result.total,
      },
    };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
}

// Helper function to recalculate subtotal and total with optional tax rate update
async function recalculateQuotationTotals(
  serviceInquiryId: string,
  newTaxRate?: number,
) {
  try {
    // Get all quotation items for this service inquiry using SQL SUM
    const [sumResult] = await db
      .select({
        subtotal:
          sql<number>`COALESCE(SUM(CAST(${quotationItems.total} AS DECIMAL(10, 2))), 0)`.as(
            "subtotal",
          ),
      })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, serviceInquiryId));

    // Ensure subtotal is a number
    const subtotal =
      typeof sumResult?.subtotal === "string"
        ? parseFloat(sumResult.subtotal)
        : sumResult?.subtotal || 0;

    // Get current tax rate if not provided
    let taxRate: number;
    if (newTaxRate !== undefined) {
      taxRate = newTaxRate;
    } else {
      const [currentInquiry] = await db
        .select({
          taxRate: serviceInquiries.taxRate,
        })
        .from(serviceInquiries)
        .where(eq(serviceInquiries.id, serviceInquiryId))
        .limit(1);

      const taxRateStr = currentInquiry?.taxRate?.toString() || "0";
      taxRate = parseFloat(taxRateStr);
    }

    // Calculate tax amount and total
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Update the service inquiry with new calculations
    await db
      .update(serviceInquiries)
      .set({
        subtotal: subtotal.toFixed(2),
        taxRate: taxRate.toFixed(2),
        total: total.toFixed(2),
      })
      .where(eq(serviceInquiries.id, serviceInquiryId));

    return {
      subtotal: subtotal,
      taxRate: taxRate,
      total: total,
    };
  } catch (error) {
    throw new Error("Failed to recalculate quotation totals");
  }
}

// Get single service inquiry by ID with all details
export async function getServiceInquiryById(id: string) {
  try {
    const [inquiry] = await db
      .select({
        id: serviceInquiries.id,
        name: serviceInquiries.name,
        companyName: serviceInquiries.companyName,
        service: serviceInquiries.service,
        email: serviceInquiries.email,
        address: serviceInquiries.address,
        phoneNumber: serviceInquiries.phoneNumber,
        quotationNumber: serviceInquiries.quotationNumber,
        subtotal: serviceInquiries.subtotal,
        taxRate: serviceInquiries.taxRate,
        total: serviceInquiries.total,
        notes: serviceInquiries.notes,
        terms: serviceInquiries.terms,
        read: serviceInquiries.read,
        createdAt: serviceInquiries.createdAt,
      })
      .from(serviceInquiries)
      .where(eq(serviceInquiries.id, id))
      .limit(1);

    if (!inquiry) {
      throw new Error("Service inquiry not found");
    }

    // Ensure numeric values are properly converted
    return {
      ...inquiry,
      subtotal: inquiry.subtotal?.toString() || "0",
      taxRate: inquiry.taxRate?.toString() || "0",
      total: inquiry.total?.toString() || "0",
    };
  } catch (error) {
    throw new Error("Failed to fetch service inquiry");
  }
}

// Update read status of service inquiry
export async function updateServiceInquiryReadStatus(
  id: string,
  read: boolean,
) {
  try {
    
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session) {
      return { error: "Unauthorized!" };
    }

    await db
      .update(serviceInquiries)
      .set({
        read: read,
      })
      .where(eq(serviceInquiries.id, id));

    // Log the action
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "service_inquiries",
      recordId: id,
      timestamp: new Date(),
      userId: session.user.id,
      details: JSON.stringify({
        action: read
          ? "Service inquiry marked as read"
          : "Service inquiry marked as unread",
        data: { id, read },
      }),
      ipAddress: session?.session.ipAddress || "unknown",
      userAgent: session?.session.userAgent || "unknown",
    });

    revalidatePath("/admin/service-inquiries");
    revalidatePath(`/admin/service-inquiries/${id}`);

    return {
      success: `Service inquiry marked as ${read ? "read" : "unread"} successfully`,
    };
  } catch (error) {
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

// Get quotation totals for a service inquiry
export async function getQuotationTotals(serviceInquiryId: string) {
  try {
    const [inquiry] = await db
      .select({
        subtotal: serviceInquiries.subtotal,
        taxRate: serviceInquiries.taxRate,
        total: serviceInquiries.total,
      })
      .from(serviceInquiries)
      .where(eq(serviceInquiries.id, serviceInquiryId))
      .limit(1);

    if (!inquiry) {
      throw new Error("Service inquiry not found");
    }

    // Convert string values to numbers
    const subtotal = inquiry.subtotal
      ? parseFloat(inquiry.subtotal.toString())
      : 0;
    const taxRate = inquiry.taxRate
      ? parseFloat(inquiry.taxRate.toString())
      : 0;
    const total = inquiry.total ? parseFloat(inquiry.total.toString()) : 0;

    return {
      subtotal: subtotal,
      taxRate: taxRate,
      total: total,
    };
  } catch (error) {
    throw new Error("Failed to fetch quotation totals");
  }
}