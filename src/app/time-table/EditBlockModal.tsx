"use client"

import { useState, useEffect } from "react"
import supabase from "@/lib/supabaseClient"
import { Dialog } from "@headlessui/react"
import { Button } from "@/components/ui/button"

export default function EditBlockModal({
  isOpen,
  onClose,
  block,
  day,
  slot,
  refresh,
}: {
  isOpen: boolean
  onClose: () => void
  block: any
  day: string
  slot: string
  refresh: () => void
}) {
  const [form, setForm] = useState({
    subject: "",
    room: "",
    teacher: "",
    comment: "",
    reminder: "",
  })

  useEffect(() => {
    if (block) {
      setForm({
        subject: block.subject || "",
        room: block.room || "",
        teacher: block.teacher || "",
        comment: block.comment || "",
        reminder: block.reminder ? block.reminder.slice(0, 16) : "",
      })
    } else {
      setForm({
        subject: "",
        room: "",
        teacher: "",
        comment: "",
        reminder: "",
      })
    }
  }, [block])

  const handleChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form.subject.trim()) return

    if (block) {
      await supabase.from("timetable").update({
        ...form,
        reminder: form.reminder || null,
      }).eq("id", block.id)
    } else {
      await supabase.from("timetable").insert({
        ...form,
        day,
        start_time: slot,
        end_time: null, // or calculate 1hr ahead if needed
      })
    }

    onClose()
    refresh()
  }

  const handleDelete = async () => {
    if (block) {
      await supabase.from("timetable").delete().eq("id", block.id)
    }
    onClose()
    refresh()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-[#111] text-white rounded-xl p-6 border border-neon shadow-lg">
          <Dialog.Title className="text-neon text-xl mb-4 font-semibold">
            {block ? "Edit Block" : "Add Block"}
          </Dialog.Title>

          <form className="space-y-4">
            <input
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full bg-black border border-neon px-3 py-2 rounded-md text-white focus:outline-none"
            />
            <input
              name="room"
              placeholder="Room"
              value={form.room}
              onChange={handleChange}
              className="w-full bg-black border border-neon px-3 py-2 rounded-md text-white"
            />
            <input
              name="teacher"
              placeholder="Teacher"
              value={form.teacher}
              onChange={handleChange}
              className="w-full bg-black border border-neon px-3 py-2 rounded-md text-white"
            />
            <textarea
              name="comment"
              placeholder="Comment"
              value={form.comment}
              onChange={handleChange}
              className="w-full bg-black border border-neon px-3 py-2 rounded-md text-white"
            />
            <input
              type="datetime-local"
              name="reminder"
              value={form.reminder}
              onChange={handleChange}
              className="w-full bg-black border border-neon px-3 py-2 rounded-md text-white"
            />
          </form>

          <div className="mt-6 flex justify-between">
            {block && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button className="bg-neon text-black" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
