import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Award, Download, Lock, CheckCircle, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'

export default function CertificationsPage() {
    const { user } = useAuthStore()
    const toast = useToast()
    const [downloading, setDownloading] = useState(false)

    const handleDownload = () => {
        setDownloading(true)
        toast.success('Generating secure PDF certificate...')
        setTimeout(() => {
            setDownloading(false)
            toast.success('Certificate downloaded successfully!')
        }, 2500)
    }

    const certificates = [
        {
            id: 1,
            title: 'Python Foundation (Hindi)',
            status: 'unlocked',
            date: new Date().toLocaleDateString(),
            progress: 100
        },
        {
            id: 2,
            title: 'Data Structures Mastery',
            status: 'in-progress',
            progress: 45
        },
        {
            id: 3,
            title: 'Web Engineering (Tamil)',
            status: 'locked',
            progress: 0
        },
        {
            id: 4,
            title: 'React Advanced',
            status: 'locked',
            progress: 0
        }
    ]

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            My Certifications
                        </h1>
                        <p className="text-gray-400">Verifiable credentials for your coding journey</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                        <div key={cert.id} className={`bg-dark-card border ${cert.status === 'unlocked' ? 'border-primary/50' : 'border-gray-800'} rounded-2xl p-6 relative overflow-hidden flex flex-col`}>

                            {/* Decorative Background */}
                            {cert.status === 'unlocked' && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-3xl translate-x-10 -translate-y-10" />
                            )}

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    {cert.status === 'unlocked' ? (
                                        <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                    ) : cert.status === 'in-progress' ? (
                                        <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-800 text-gray-400 rounded-full flex items-center justify-center">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{cert.title}</h3>
                                        <p className="text-sm text-gray-400">
                                            {cert.status === 'unlocked' ? `Issued on ${cert.date}` : 'Complete course to unlock'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="text-white font-medium">{cert.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                                    <div
                                        className={`h-2 rounded-full ${cert.status === 'unlocked' ? 'bg-green-500' : 'bg-primary'}`}
                                        style={{ width: `${cert.progress}%` }}
                                    />
                                </div>

                                {cert.status === 'unlocked' ? (
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                        {downloading ? 'Generating PDF...' : 'Download Certificate'}
                                    </button>
                                ) : (
                                    <button disabled className="w-full py-3 bg-dark text-gray-500 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed border border-gray-800">
                                        <Lock className="w-4 h-4" />
                                        Locked
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}
