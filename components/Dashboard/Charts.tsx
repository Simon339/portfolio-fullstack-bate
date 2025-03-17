import React from 'react'
import { Card } from "@/components/ui/card"
import { CalendarIcon, PackageIcon, UsersIcon } from 'lucide-react'
// import { LineCharts } from '../charts/ProjectChart'
// import { Piecharts } from '../charts/FinanceChart'
// import { BarCharts } from '../charts/CountChart'



const Charts = () => {
    return (
        <section className='mt-2'>
        <h1 className="text-3xl text-center font-bold text-green-800 mb-4">Reports & Statistics</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Prodjects Performance</div>
                        <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    {/* <div className="mt-4">
                        <LineCharts  />
                    </div> */}
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Product Performance</div>
                        <PackageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    {/* <div className="mt-4">
                        <BarCharts />
                    </div> */}
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Users</div>
                        <UsersIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    {/* <div className="mt-4">
                        <Piecharts />
                    </div> */}
                </Card>
            </div>
        </section>
    )
}

export default Charts