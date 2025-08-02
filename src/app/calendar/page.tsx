"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { cn } from "@/lib/utils"

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks, setTasks] = useState<{ [key: string]: string[] }>({})
  const [showPopup, setShowPopup] = useState(false)
  const [editingTask, setEditingTask] = useState<{ index: number; dateKey: string } | null>(null)
  const [taskInput, setTaskInput] = useState("")

  const dateKey = format(selectedDate, "yyyy-MM-dd")

  const openAddTask = () => {
    setTaskInput("")
    setEditingTask(null)
    setShowPopup(true)
  }

  const openEditTask = (index: number) => {
    setTaskInput(tasks[dateKey]?.[index] || "")
    setEditingTask({ index, dateKey })
    setShowPopup(true)
  }

  const handleSaveTask = () => {
    if (taskInput.trim() === "") return

    const updated = { ...tasks }
    if (editingTask) {
      updated[editingTask.dateKey][editingTask.index] = taskInput
    } else {
      updated[dateKey] = [...(updated[dateKey] || []), taskInput]
    }
    setTasks(updated)
    setShowPopup(false)
    setTaskInput("")
  }

  const handleDeleteTask = () => {
    if (!editingTask) return
    const updated = { ...tasks }
    updated[editingTask.dateKey].splice(editingTask.index, 1)
    if (updated[editingTask.dateKey].length === 0) delete updated[editingTask.dateKey]
    setTasks(updated)
    setShowPopup(false)
  }

  const renderHeader = () => (
    <div className="flex justify-between items-center px-4 py-2 border-b border-neon">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-neon">
        ◀
      </button>
      <h2 className="text-xl text-white font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-neon">
        ▶
      </button>
    </div>
  )

  const renderDays = () => {
    const days = []
    const startDate = startOfWeek(new Date())

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-neon text-sm">
          {format(addDays(startDate, i), "EEE")}
        </div>
      )
    }
    return <div className="grid grid-cols-7 text-white mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        days.push(
          <div
            key={cloneDay.toString()}
            className={cn(
              "p-2 text-center border border-gray-700 cursor-pointer text-sm",
              isSameMonth(cloneDay, monthStart) ? "text-white" : "text-gray-500",
              isSameDay(cloneDay, selectedDate) ? "bg-neon text-black font-bold" : "hover:bg-gray-800"
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            {format(cloneDay, "d")}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return <div className="space-y-1">{rows}</div>
  }

  const renderTasks = () => (
    <div className="p-4 border-t border-neon relative">
      <h3 className="text-lg text-neon mb-2">Tasks on {format(selectedDate, "dd MMM yyyy")}</h3>
      <ul className="space-y-2">
        {(tasks[dateKey] || []).map((task, idx) => (
          <li
            key={idx}
            onClick={() => openEditTask(idx)}
            className="bg-gray-800 text-white p-3 rounded-xl shadow cursor-pointer hover:bg-gray-700"
          >
            {task}
          </li>
        ))}
      </ul>
      <button
        onClick={openAddTask}
        className="mt-4 text-neon border border-neon rounded-xl px-4 py-1 hover:bg-neon hover:text-black transition-all"
      >
        + Add Task
      </button>
    </div>
  )

  const renderPopup = () =>
    showPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-[90%] max-w-sm">
          <h3 className="text-neon text-lg font-bold mb-4">
            {editingTask ? "Edit Task" : "Add Task"}
          </h3>
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Enter task..."
            className="w-full p-2 rounded-lg mb-4 bg-black border border-neon text-white"
          />
          <div className="flex justify-end gap-2">
            {editingTask && (
              <button
                onClick={handleDeleteTask}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => setShowPopup(false)}
              className="px-3 py-1 border border-gray-500 text-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTask}
              className="px-3 py-1 bg-neon text-black rounded-lg font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )

  return (
    <div className="bg-black min-h-screen p-2 sm:p-4 text-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
        <div>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
        <div>{renderTasks()}</div>
      </div>
      {renderPopup()}
    </div>
  )
}

export default CalendarPage
