"use client";

import { logoutUser } from "@/server/data/user";
import { motion } from "framer-motion";
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react";


export default function AccountDeletionRequestedPage() {
  const onClick = () => {
    logoutUser();
    };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 ">
            Account Deletion Requested
          </h1>
          <p className="mt-2 text-gray-500 text-sm max-w-sm">
            Your account has been scheduled for deletion as per your request.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="py-4 px-5 bg-gray-50  rounded-lg text-left"
        >
          <p className="text-sm text-gray-700">
            If you wish to cancel the deletion request, please contact our
            support team. Otherwise, your account and all associated data will
            be permanently deleted according to our data retention policy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700  text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => "/contact"}
            className="px-4 py-2 rounded-md bg-gray-900  text-white text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 "
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}