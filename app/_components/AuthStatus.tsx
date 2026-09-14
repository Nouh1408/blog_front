"use client"
import Link from "next/link"
import { useSelector } from "react-redux"
import { RootState } from "../_store/store"

export default function AuthStatus() {
  const {user, isAuthenticated} = useSelector(
    (state:RootState)=>state.auth
  );

  if(isAuthenticated && user){
    return(
        <span className="text-sm font-medium text-foreground/80">
Hi, {user.firstName} {user.lastName}
    </span>
    )
  }
  return(
    <>
    <Link
        href="/auth/login"
        className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
      >
        Log in
      </Link>

      <Link
        href="/auth/register"
        className="text-sm font-semibold px-4 py-1.5 rounded-full bg-primary hover:bg-accent text-foreground shadow-sm hover:shadow transition-all"
      >
        Register
      </Link>
    </>
  )
}

