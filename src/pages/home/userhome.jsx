import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiTruck, FiList, FiCalendar } from 'react-icons/fi'

const menus = [
  {
    name: 'แดชบอร์ด',
    to: '/user/dashboard',
    icon: FiHome,
    description: 'ภาพรวมการจอง',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-500',
    dot: 'bg-purple-500',
  },
  {
    name: 'จองคิวรถรับ-ส่ง',
    to: '/user/reserve',
    icon: FiTruck,
    description: 'จองรถโรงพยาบาล',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-500',
    dot: 'bg-emerald-500',
  },
  {
    name: 'รายการจอง',
    to: '/user/bookings',
    icon: FiList,
    description: 'ดูการจองทั้งหมด',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-500',
    dot: 'bg-amber-500',
  },
  {
    name: 'ปฏิทินการจอง',
    to: '/user/calendar',
    icon: FiCalendar,
    description: 'ตารางนัดหมาย',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    border: 'border-red-200',
    hoverBorder: 'hover:border-red-500',
    dot: 'bg-red-500',
  },
]

function Userhome() {
  return (
    <div className="p-6 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
          <FiTruck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800 leading-tight">เมนูหลัก</p>
          <p className="text-xs text-gray-400 mt-0.5">เลือกรายการที่ต้องการ</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {menus.map((menu) => {
          const Icon = menu.icon
          return (
            <Link
              key={menu.to}
              to={menu.to}
              className="no-underline"
            >
              <div
                className={`
                  relative bg-white rounded-2xl border-2 ${menu.border} ${menu.hoverBorder}
                  p-6 flex flex-col items-center gap-2
                  transition-all duration-200
                  hover:-translate-y-1 hover:shadow-lg
                  cursor-pointer overflow-hidden
                `}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${menu.iconBg} flex items-center justify-center mb-1`}>
                  <Icon className={`w-8 h-8 ${menu.iconColor}`} strokeWidth={1.6} />
                </div>

                {/* Text */}
                <span className="text-sm font-semibold text-gray-800 text-center leading-snug">
                  {menu.name}
                </span>
                <span className="text-xs text-gray-400 text-center">
                  {menu.description}
                </span>

                {/* Dot accent */}
                <div className={`absolute bottom-2.5 right-3 w-2 h-2 rounded-full ${menu.dot} opacity-40`} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Userhome