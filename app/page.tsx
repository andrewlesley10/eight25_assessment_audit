import { UrlForm } from "@/components/audit/url-form";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#07101c] bg-page-glow px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <UrlForm />
      </div>
    </main>
  );
}
