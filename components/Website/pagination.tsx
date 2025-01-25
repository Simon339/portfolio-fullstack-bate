'use client';

import Image from 'next/image'
import { useState } from "react";
import { projectsData } from "@/data";
import { motion } from "framer-motion";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TbWorld } from "react-icons/tb";
import { useRouter } from 'next/navigation';

const Pagination = () => {

    const paginationVariants = {
        hidden: {
            opacity: 0,
            y: 100,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 2,
            },
        },
    };

    // Using TypeScript for type safety (optional)
    const [items, ] = useState(projectsData.slice(0, 50)); // 'item' -> 'items'
    const [pageNumber, setPageNumber] = useState(0);

    const projectsPerPage = 4;
    const pagesVisited = pageNumber * projectsPerPage;

    const displayProjects = items
        .slice(pagesVisited, pagesVisited + projectsPerPage)
        .map((item) => {
            return (
                <div className="flex items-center justify-center sm:w-96 w-[80vw] cursor-pointer" key={item.id} onClick={() => router.push(`/projects/${item.id}`)}>
                    <div className="work_card">
                        <div className="work_item">
                            <Image width={300} height={100} src={item.img} alt="cover" className="work_img" />
                        </div>

                        <h1 className="font-bold lg:text-2xl md:text-xl text-base line-clamp-1">
                            {item.title}
                        </h1>

                        <p
                            className="lg:text-[12px] lg:font-normal font-light text-sm line-clamp-2"
                            style={{ color: "#BEC1DD", margin: "1vh 0" }}
                        >
                            {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-7 mb-3">
                            <div className="flex items-center">
                                {item.iconLists?.map((icon, index) => (
                                    <div
                                        key={index}
                                        className="border border-white/[.2] rounded-full bg-white lg:w-12 lg:h-12 w-10 h-10 flex justify-center items-center"
                                        style={{ transform: `translateX(-${5 * index + 2}px)` }}
                                    >
                                        <Image width={80} height={80} src={icon} alt={`icon-${index}`} className="p-2" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center items-center">
                                <a href={item.link} className="flex lg:text-base md:text-xs text-xs text-sky-800">
                                    Live Site
                                </a>
                                <TbWorld className="ms-2" color="#CBACF9" />
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

    const pageCount = Math.ceil(items.length / projectsPerPage);

    const changePage = ({ selected }) => {
        setPageNumber(selected);
    };

    const router = useRouter();

    return (
        <motion.div
            variants={paginationVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="work_container grid">
                {displayProjects}
            </div>
            <ReactPaginate
                nextLabel={
                    <span className="w-10 h-10 flex items-center justify-center bg-transparent rounded-md">
                        <ChevronRight />
                    </span>
                }
                onPageChange={changePage}
                pageCount={pageCount}
                previousLabel={
                    <span className="w-10 h-10 flex items-center justify-center bg-transparent rounded-md mr-4">
                        <ChevronLeft />
                    </span>
                }
                containerClassName="flex items-center justify-center mt-8 mb-4"
                pageClassName="block border border-solid border-[#685189] hover:bg-[#685199] w-10 h-10 flex items-center justify-center rounded-md mr-4"
                activeClassName="bg-[#685189] text-white"
            />
        </motion.div>
    );
}

export default Pagination;
