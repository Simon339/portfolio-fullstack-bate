'use client'

// import Link from "next/link"
// import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet"
// import { cn } from "@/lib/utils"
// import { usePathname } from "next/navigation"
// import Image from "next/image"
// import Footerdash from "./Footerdash"
// import { sidebarLinks } from "@/data"
// import { AlignJustify } from "lucide-react"


// const MobSideBar = ( MobSideBarProps) => {
//   const pathname = usePathname();
//   return (
//     <section className="w-full max-w-[264px]">
//       <Sheet>
//         <SheetTrigger>
//           <AlignJustify
//             className="cursor-pointer w-[30px] h-[30px]"
//           />
//         </SheetTrigger>
//         <SheetContent side="left" className="border-none bg-black-200 backdrop-blur-sm">
//           <Link href="/" className="cursor-pointer flex items-center gap-1 px-4">
//             <Image
//               src="/logo.png"
//               width={34}
//               height={34}
//               alt="logo"
//             />
//             <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Portfolio</h1>
//           </Link>
//           <div className="mobilenav-sheet">
//             <SheetClose asChild>
//               <nav className="flex h-full flex-col gap-6 pt-16 text-white">
//                 {sidebarLinks.map((item) => {
//                   const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`)

//                   return (
//                     <SheetClose asChild key={item.route}>
//                       <Link href={item.route} key={item.label}
//                         className={cn('mobilenav-sheet_close w-full', { 'bg-bank-gradient': isActive })}
//                       >
//                         <Image
//                           src={item.imgURL}
//                           alt={item.label}
//                           width={20}
//                           height={20}
//                           className={cn({
//                             'brightness-[3] invert-0': isActive
//                           })}
//                         />
//                         <p className={cn("text-16 font-semibold text-black-2", { "text-white": isActive })}>
//                           {item.label}
//                         </p>
//                       </Link>
//                     </SheetClose>
//                   )
//                 })}

                
//               </nav>
//             </SheetClose>
//             <Footerdash type="mobile" />
//           </div>
//         </SheetContent>
//       </Sheet>
//     </section>
//   )
// }

// export default MobSideBar