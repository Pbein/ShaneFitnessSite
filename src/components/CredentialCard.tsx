import type { Credential } from "@/content/site";
import { CredentialIcon } from "./Icons";

export function CredentialCard({ credential }: { credential: Credential }) {
  return (
    <div className="card-surface group h-full p-6">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <CredentialIcon name={credential.icon} className="h-6 w-6" />
      </div>
      <h3 className="text-lg tracking-tightish text-cream-100">{credential.title}</h3>
      <div className="mt-2 space-y-0.5">
        {credential.lines.map((line, i) => (
          <p key={i} className="text-sm leading-relaxed text-cream-300">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
