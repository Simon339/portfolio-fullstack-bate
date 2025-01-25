/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'
import Image from "next/image"
import { Button } from '../ui/button';
import Link from 'next/link';

type Project = {
    id: number;
    title: string;
    description: string;
    category: string;
    iconLists: string[];
    link: string;
    img: string;
    iconlists?: undefined;
    features: string[];
    Features?: undefined;
};

interface ProjectDetailProps {
    project: Project;
}

const ProjectDetails = ({ project }: ProjectDetailProps) => {
    const [projects, setProject] = useState<Project | null>(project);
    return (
        <div className="mx-auto pt-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="relative aspect-square flex justify-items-center justify-center items-center align-middle overflow-hidden rounded-lg">
                        <Image
                            src={project.img}
                            alt={`Product image ${project.title}`}
                            fill
                            className='object-fill h-[330px] border border-black-100 rounded w-[460px]'
                        //className="h-[330.5px] max-h-fit  flex justify-items-center justify-center items-center align-middle -sm w-[460.5px] max-w-full"
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <span className='pt-3'></span>
                    <p className="text-gray-200">Here are the technologies I use to develop the {project.category}:</p>
                    <div className="flex items-center space-x-2">
                        <div className="flex">
                            {project.iconLists.map((icon, index) => (
                                <div
                                    key={index}
                                    className="border border-white/[.2] rounded-full bg-black lg:w-14 lg:h-14 w-10 h-10 flex justify-center items-center"
                                    style={{ transform: `translateX(-${5 * index + 2}px)` }}
                                >
                                    <Image width={80} height={80} src={icon} alt={`icon-${index}`} className="p-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-200">{project.description}</p>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Features</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {project.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                <div className="pt-2">
                    <Link href={project.link}>
                        <Button className="w-full bg-white-100 hover:bg-indigo-700">
                            Demo
                        </Button>
                    </Link>
                </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectDetails