import React from 'react'
import { ArrowLeft, FileText, Plus, Trash2, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { createLocalFileRecord, readLocalFiles, writeLocalFiles } from '../utils/localWorkspace'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const FilesPage: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [files, setFiles] = React.useState(() => readLocalFiles())
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState('Document')

  const addFile = () => {
    const cleanName = name.trim()
    if (!cleanName) {
      showToast({ message: 'Add a file name first.', type: 'warning' })
      return
    }

    const file = createLocalFileRecord({ name: cleanName, type, owner: activeProfile.name })
    if (!writeLocalFiles([file, ...files])) {
      showToast({ message: "We couldn't save this file. Please try again.", type: 'error' })
      return
    }

    setFiles([file, ...files])
    setName('')
    setType('Document')
    showToast({ message: 'File saved', type: 'success' })
  }

  const deleteFile = (fileId: string) => {
    const nextFiles = files.filter((file) => file.id !== fileId)
    if (!writeLocalFiles(nextFiles)) {
      showToast({ message: "We couldn't delete this file. Please try again.", type: 'error' })
      return
    }
    setFiles(nextFiles)
    showToast({ message: 'File deleted', type: 'success' })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <header className="mb-6">
          <h1 className="text-3xl font-black sm:text-4xl">Files</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Keep important documents, briefs, contracts, and assets easy to find.</p>
        </header>

        <section className={`${panel} mb-5 p-4 sm:p-5`}>
          <h2 className="text-xl font-black">Add a file record</h2>
          <p className="mt-1 text-sm text-slate-600">For now this stores file details locally so the workflow is easy to demo.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
            <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Project brief.pdf" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="min-h-[48px] rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10">
              <option>Document</option>
              <option>Image</option>
              <option>Spreadsheet</option>
              <option>Presentation</option>
              <option>Other</option>
            </select>
            <Button type="button" onClick={addFile} className="min-h-[48px] gap-2"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </section>

        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-black">Saved files</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {files.length ? files.map((file) => (
              <article key={file.id} className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{file.name}</p>
                  <p className="text-sm font-semibold text-slate-500">{file.type} - saved by {file.owner}</p>
                </div>
                <button type="button" onClick={() => deleteFile(file.id)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete file">
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            )) : (
              <div className="p-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500">
                  <Upload className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-black">No files yet</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Files help your team find important documents without asking around.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default FilesPage
