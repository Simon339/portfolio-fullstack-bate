"use client"

import { motion } from "framer-motion"

const Help = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
            <div className="text-center">
                <motion.h1
                    className="mb-4 text-4xl font-bold text-blue-800 sm:text-6xl"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Coming Soon
                </motion.h1>
                <motion.p
                    className="mb-8 text-lg text-blue-600 sm:text-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                    We&apos;re working hard to bring you something amazing. Stay tuned!
                </motion.p>
                <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                >
                    <div className="relative h-32 w-32">
                        <motion.div
                            className="absolute inset-0 rounded-full bg-blue-500 opacity-75"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-blue-300 opacity-75"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.8, 0.5, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Help