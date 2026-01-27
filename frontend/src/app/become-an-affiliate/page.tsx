"use client"
import { redirect, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function page() {
    // const router = useRouter()
    useEffect(() => {
        redirect("/auth?mode=register")
    }, [])
    return
}
