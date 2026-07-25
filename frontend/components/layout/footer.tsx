import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Onevriksh Accounts</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-brand-700 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-700 transition-colors">Terms of Service</Link>
            <Link href="/security" className="hover:text-brand-700 transition-colors">Security</Link>
            <a href="mailto:support@onevriksh.in" className="hover:text-brand-700 transition-colors">Support</a>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Onevriksh
          </p>
        </div>
      </div>
    </footer>
  );
}
