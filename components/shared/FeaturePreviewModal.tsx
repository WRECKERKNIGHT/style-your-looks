"use client";

import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/shared/Modal";

export interface FeaturePreviewData {
  title: string;
  description: string;
  image: string;
  route: string;
  tags: string[];
  cta: string;
}

interface FeaturePreviewModalProps {
  data: FeaturePreviewData | null;
  onClose: () => void;
}

export function FeaturePreviewModal({ data, onClose }: FeaturePreviewModalProps) {
  return (
    <Modal open={!!data} onClose={onClose} label={data?.title}>
      {data && (
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-[220px] md:min-h-full">
            <Image
              src={data.image}
              alt={data.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="p-8 md:p-10">
            <span className="section-number">PREVIEW</span>
            <h3 className="type-heading text-2xl text-[var(--text-primary)] mt-2">
              {data.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed mt-4">
              {data.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="type-mono text-[0.55rem] text-[var(--accent-mocha)] tracking-widest uppercase px-3 py-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href={data.route}
                onClick={onClose}
                className="btn-nexus inline-flex items-center justify-center gap-2"
              >
                {data.cta} <span className="text-lg leading-none">&rarr;</span>
              </Link>
              <button
                onClick={onClose}
                className="btn-outline inline-flex items-center justify-center"
              >
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
