'use client'

import { motion } from 'framer-motion';


export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <motion.h1
        className="text-4xl md:text-6xl font-bold mb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Coming Soon
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl mb-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        We&apos;re working hard to bring you something amazing!
      </motion.p>
      {/* <Laptop /> */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
      </motion.div>
    </div>
  );
}


