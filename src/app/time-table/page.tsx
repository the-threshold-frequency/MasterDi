"use client"

import { useEffect, useState } from "react"
import supabase from "@/lib/supabaseClient"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

type Task = {
  id: string
  day: string
  time_slot: string
  title: string
  comment?: string
  reminder?: string
}

export default function TimeTablePage() {
  const [timeSlots, setTimeSlots] = useState(["08:00", "09:00", "10:00"])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selected, setSelected] = useState({ day: '', time: '' })
  const [editData, setEditData] = useState({ title: '', comment: '', reminder: '' })
  const [editMode, setEditMode] = useState(false)
  const [open, setOpen] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [editTaskId, setEditTaskId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('timetable_tasks').select('*')
    if (error) console.error("Fetch error:", error)
    else setTasks(data as Task[])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleSave = async () => {
    const payload = {
      day: selected.day,
      time_slot: selected.time,
      title: editData.title,
      comment: editData.comment || null,
      reminder: editData.reminder ? new Date(editData.reminder).toISOString() : null,
    }

    try {
      if (isEditingExisting && editTaskId) {
        const { error } = await supabase
          .from("timetable_tasks")
          .update(payload)
          .eq("id", editTaskId)
        if (error) console.error("Update error:", error)
      } else {
        const { error } = await supabase.from("timetable_tasks").insert(payload)
        if (error) console.error("Insert error:", error)
      }
    } catch (e) {
      console.error("Unexpected error during insert/update:", e)
    }

    setOpen(false)
    setEditTaskId(null)
    fetchTasks()
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    const { error } = await supabase.from('timetable_tasks').delete().eq('id', confirmDeleteId)
    if (error) console.error("Delete error:", error)
    setConfirmDeleteId(null)
    fetchTasks()
  }

  const groupedTasks = (day: string, time: string) => {
    return tasks.filter(t => t.day === day && t.time_slot === time)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-neon">My Timetable</h1>
        <Button variant="outline" onClick={() => setEditMode(!editMode)}>
          {editMode ? "Lock" : "Edit"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
          <div></div>
          {days.map(day => (
            <div key={day} className="text-center text-neon font-semibold border-b border-gray-600 py-2">
              {day}
            </div>
          ))}

          {timeSlots.map(slot => (
            <div className="contents" key={`row-${slot}`}>
              <div className="border-r border-gray-600 py-2 text-sm text-gray-300 text-right pr-2 relative">
                {slot}
                {editMode && (
                  <button
                    className="absolute right-1 top-1 text-red-400"
                    onClick={() => setTimeSlots(prev => prev.filter(s => s !== slot))}
                  >
                    ✕
                  </button>
                )}
              </div>
              {days.map(day => (
                <div
                  key={`${day}-${slot}`}
                  className="h-24 border border-gray-700 p-1 hover:bg-[#111] cursor-pointer"
                  onClick={(e) => {
                    if (!editMode) return
                    // Clicking background = add new task
                    if ((e.target as HTMLElement).closest(".task-item")) return

                    setSelected({ day, time: slot })
                    setEditData({ title: '', comment: '', reminder: '' })
                    setIsEditingExisting(false)
                    setEditTaskId(null)
                    setOpen(true)
                  }}
                >
                  {groupedTasks(day, slot).map(task => (
                    <div
                      key={task.id}
                      className="task-item bg-[#1a1a1a] text-xs p-1 rounded-md mb-1 border border-neon relative"
                      onClick={(e) => {
                        if (!editMode) return
                        e.stopPropagation()
                        setSelected({ day, time: slot })
                        setEditData({
                          title: task.title,
                          comment: task.comment || '',
                          reminder: task.reminder
                            ? new Date(task.reminder).toISOString().slice(0, 16)
                            : '',
                        })
                        setIsEditingExisting(true)
                        setEditTaskId(task.id)
                        setOpen(true)
                      }}
                    >
                      <div className="font-bold text-neon">{task.title}</div>
                      {task.comment && <div className="text-gray-400 text-xs">{task.comment}</div>}
                      {editMode && (
                        <button
                          className="absolute top-1 right-1 text-red-400 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteId(task.id)
                          }}
                        >✕</button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {editMode && (
          <div className="mt-4 flex gap-2">
            <Button onClick={() => {
              const time = prompt("New time (HH:MM):")?.trim()
              if (time) setTimeSlots(prev => [...prev, time])
            }}>
              <Plus className="w-4 h-4 mr-1" /> Add Time Slot
            </Button>
          </div>
        )}
      </div>

      {/* Task Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#121212] border border-neon text-white">
          <DialogHeader>
            <DialogTitle className="text-neon">
              {isEditingExisting ? "Edit Task" : "Add Task"} ({selected.day} @ {selected.time})
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Task title"
            value={editData.title}
            onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Comment"
            value={editData.comment}
            onChange={e => setEditData(prev => ({ ...prev, comment: e.target.value }))}
          />
          <Input
            type="datetime-local"
            value={editData.reminder}
            onChange={e => setEditData(prev => ({ ...prev, reminder: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="bg-[#121212] border border-red-500 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-400">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
