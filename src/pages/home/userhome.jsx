import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiTruck, FiList, FiCalendar } from 'react-icons/fi'

const menus = [
    {
        name: 'แดชบอร์ด',
        to: '/user/dashboard',
        icon: FiHome,
        description: 'ภาพรวมการจอง',
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50',
        border: 'border-purple-200',
        hoverBorder: 'hover:border-purple-400',
        hoverShadow: 'hover:shadow-purple-100',
        dot: 'bg-purple-400',
    },
    {
        name: 'จองคิวรถรับ-ส่ง',
        to: '/user/reserve',
        icon: FiTruck,
        description: 'จองรถโรงพยาบาล',
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50',
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-400',
        hoverShadow: 'hover:shadow-emerald-100',
        dot: 'bg-emerald-400',
    },
    {
        name: 'รายการจอง',
        to: '/user/bookings',
        icon: FiList,
        description: 'ดูการจองทั้งหมด',
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-50',
        border: 'border-amber-200',
        hoverBorder: 'hover:border-amber-400',
        hoverShadow: 'hover:shadow-amber-100',
        dot: 'bg-amber-400',
    },
    {
        name: 'ปฏิทินการจอง',
        to: '/user/calendar',
        icon: FiCalendar,
        description: 'ตารางนัดหมาย',
        iconColor: 'text-red-400',
        iconBg: 'bg-red-50',
        border: 'border-red-200',
        hoverBorder: 'hover:border-red-400',
        hoverShadow: 'hover:shadow-red-100',
        dot: 'bg-red-400',
    },
]

function Userhome() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200 flex-shrink-0">
                            <FiTruck className="w-5 h-5 text-white" />
                             <p className="text-lg font-semibold text-gray-800 leading-tight">เมนูหลัก</p>
                            <p className="text-xs text-gray-400 mt-0.5">เลือกรายการที่ต้องการ</p>
                        </div>
                        <div>
                            {/* <p className="text-lg font-semibold text-gray-800 leading-tight">เมนูหลัก</p>
                            <p className="text-xs text-gray-400 mt-0.5">เลือกรายการที่ต้องการ</p> */}
                        </div>
                    </div>
                </div>

                {/* Grid — 2 cols on mobile, stays 2 cols */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {menus.map((menu) => {
                        const Icon = menu.icon
                        return (
                            <Link
                                key={menu.to}
                                to={menu.to}
                                className="no-underline group"
                            >
                                <div
                                    className={`
                    relative bg-white rounded-2xl border ${menu.border} ${menu.hoverBorder}
                    ${menu.hoverShadow}
                    p-5 sm:p-7
                    flex flex-col items-center gap-2 sm:gap-3
                    transition-all duration-200 ease-out
                    hover:-translate-y-0.5 hover:shadow-lg
                    cursor-pointer overflow-hidden
                    h-full
                  `}
                                >
                                    {/* Icon circle */}
                                    <div
                                        className={`
                      w-14 h-14 sm:w-16 sm:h-16
                      rounded-2xl ${menu.iconBg}
                      flex items-center justify-center
                      mb-1
                    `}
                                    >
                                        <Icon
                                            className={`w-7 h-7 sm:w-8 sm:h-8 ${menu.iconColor}`}
                                            strokeWidth={1.6}
                                        />
                                    </div>

                                    {/* Labels */}
                                    <span className="text-sm sm:text-base font-semibold text-gray-700 text-center leading-snug">
                                        {menu.name}
                                    </span>
                                    <span className="text-[11px] sm:text-xs text-gray-400 text-center">
                                        {menu.description}
                                    </span>

                                    {/* Dot */}
                                    <div
                                        className={`absolute bottom-2.5 right-3 w-1.5 h-1.5 rounded-full ${menu.dot} opacity-50`}
                                    />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Userhome