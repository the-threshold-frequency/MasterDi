"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { Button } from "@/components/ui/button"

const initialTimeSlots = ["08:00", "09:00", "10:00", "11:00"]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

export default function TimeTablePage() {
  const [timeSlots, setTimeSlots] = useState(initialTimeSlots)
const [tasks, setTasks] = useState<Record<string, { title: string; comment: string; reminder: string }>>({})
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const handleCellClick = (day: string, time: string) => {
    if (!editMode) return
    setSelectedSlot(`${day}_${time}`)
    setModalOpen(true)
  }

type Task = { title: string; comment: string; reminder: string }
const handleSave = (data: Task) => {

    if (selectedSlot) {
      setTasks(prev => ({ ...prev, [selectedSlot]: data }))
    }
    setModalOpen(false)
  }

  const handleDeleteTimeSlot = (index: number) => {
    if (!editMode) return
    const updated = [...timeSlots]
    updated.splice(index, 1)
    setTimeSlots(updated)
  }

  const handleAddTimeSlot = () => {
    if (!editMode) return
    const newTime = prompt("Enter new time (e.g., 12:00):")
    if (newTime) setTimeSlots([...timeSlots, newTime])
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-neon-green text-2xl font-bold">🗓️ Timetable</h1>
        <div className="flex gap-2">
          {editMode && (
            <Button className="bg-neon-pink text-black" onClick={handleAddTimeSlot}>+ Add Time</Button>
          )}
          <Button
            className={editMode ? "bg-gray-700 text-white" : "bg-neon-green text-black"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-700">
        <div className="grid grid-cols-[80px_repeat(5,minmax(0,1fr))] border-t border-l border-gray-800">
          <div className="bg-gray-800 p-2 border-b border-r border-gray-800 text-center font-semibold">Time</div>
          {days.map(day => (
            <div key={day} className="bg-gray-800 p-2 border-b border-r border-gray-800 text-center font-semibold">
              {day}
            </div>
          ))}

          {timeSlots.map((time, i) => (
            <>
              <div key={time} className="bg-gray-800 p-2 border-b border-r border-gray-800 text-center relative">
                {time}
                {editMode && (
                  <button
                    onClick={() => handleDeleteTimeSlot(i)}
                    className="absolute top-1 right-1 text-xs text-neon-red"
                  >
                    ✖
                  </button>
                )}
              </div>

              {days.map(day => {
                const key = `${day}_${time}`
                const task = tasks[key]
                return (
                  <div
                    key={key}
                    className={`p-2 border-b border-r border-gray-800 min-h-[60px] ${
                      editMode ? "hover:bg-gray-700 cursor-pointer" : ""
                    }`}
                    onClick={() => handleCellClick(day, time)}
                  >
                    <div className="text-neon-green text-sm font-medium truncate">{task?.title}</div>
                    <div className="text-gray-400 text-xs truncate">{task?.comment}</div>
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      <EditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        existing={selectedSlot ? tasks[selectedSlot] : null}
      />
    </div>
  )
}

type Task = { title: string; comment: string; reminder: string }

interface EditModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Task) => void
  existing?: Task | null
}

function EditModal({ open, onClose, onSave, existing }: EditModalProps) {

  const [title, setTitle] = useState(existing?.title || "")
  const [comment, setComment] = useState(existing?.comment || "")
  const [reminder, setReminder] = useState(existing?.reminder || "")

  const handleSubmit = () => {
    onSave({ title, comment, reminder })
    setTitle("")
    setComment("")
    setReminder("")
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center bg-black/60">
      <Dialog.Panel className="bg-gray-800 rounded-xl p-6 w-[90%] max-w-md border border-neon-pink text-white space-y-4">
        <Dialog.Title className="text-neon-pink text-lg font-semibold">Edit Task</Dialog.Title>
        <input
          className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
          placeholder="Comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <input
          type="datetime-local"
          className="w-full p-2 bg-gray-700 rounded text-white"
          value={reminder}
          onChange={e => setReminder(e.target.value)}
        />

        <div className="flex justify-between mt-4">
          <Button className="bg-gray-600" onClick={onClose}>Cancel</Button>
          <Button className="bg-neon-green text-black" onClick={handleSubmit}>Save</Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
