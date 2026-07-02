"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/motion/ScrollReveal";

const technologies = [
  { name: "Artificial Intelligence", desc: "Core AI research and applied machine learning systems.", apps: "Crop prediction, medical diagnosis", arch: "Neural pipelines + cloud inference" },
  { name: "Machine Learning", desc: "Supervised and unsupervised learning for structured data.", apps: "Yield forecasting, patient risk scoring", arch: "Feature stores + model registry" },
  { name: "Deep Learning", desc: "CNNs, transformers, and hybrid architectures.", apps: "Image classification, NLP", arch: "GPU clusters + Triton serving" },
  { name: "Computer Vision", desc: "Real-time visual intelligence for field and clinical use.", apps: "Disease detection, medical imaging", arch: "Edge cameras + cloud CV API" },
  { name: "Vision Language Models", desc: "Multimodal AI combining vision and language.", apps: "Report generation, field assistant", arch: "VLM fine-tuning pipeline" },
  { name: "Large Language Models", desc: "Clinical and agricultural knowledge systems.", apps: "Clinical pathways, research Q&A", arch: "RAG + domain fine-tuning" },
  { name: "YOLO", desc: "Real-time object detection for drones and cameras.", apps: "Pest detection, anomaly spotting", arch: "ONNX export + edge deploy" },
  { name: "TensorFlow", desc: "Production ML framework for research and deployment.", apps: "Model training, TFX pipelines", arch: "TF Serving + Kubernetes" },
  { name: "PyTorch", desc: "Research-first deep learning framework.", apps: "Medical imaging, research models", arch: "TorchServe + experiment tracking" },
  { name: "OpenCV", desc: "Image processing and classical CV algorithms.", apps: "Preprocessing, augmentation", arch: "Pipeline integration layer" },
  { name: "Remote Sensing", desc: "Satellite and aerial data analysis.", apps: "Crop monitoring, land use", arch: "GeoTIFF processing + GIS" },
  { name: "GIS", desc: "Geospatial intelligence and mapping.", apps: "Field boundaries, zone management", arch: "PostGIS + map tiles" },
  { name: "Satellite Analytics", desc: "Large-scale earth observation analytics.", apps: "NDVI, moisture, yield maps", arch: "Batch + streaming pipelines" },
  { name: "Cloud Computing", desc: "Scalable infrastructure for AI workloads.", apps: "Training, inference, storage", arch: "Multi-cloud + auto-scaling" },
  { name: "Edge AI", desc: "On-device inference for low-latency decisions.", apps: "Drone, IoT, clinical edge", arch: "Jetson + mobile deploy" },
  { name: "IoT", desc: "Connected sensor networks and data ingestion.", apps: "Soil, weather, vitals monitoring", arch: "MQTT + time-series DB" },
  { name: "Docker", desc: "Containerized ML services and reproducibility.", apps: "Model packaging, CI/CD", arch: "Container registry + compose" },
  { name: "Kubernetes", desc: "Orchestration for production AI systems.", apps: "Auto-scaling inference", arch: "K8s clusters + Helm charts" },
];

export function Technology() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="technology" className="section-light py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          light
          label="Technology Ecosystem"
          title="Interactive Technology Stack"
          subtitle="Click any technology to explore applications, architecture, and use cases."
          align="center"
        />
        <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech, i) => {
            const isOpen = expanded === tech.name;
            return (
              <ScrollReveal key={tech.name} delay={i * 0.03}>
                <motion.button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : tech.name)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full rounded-2xl border p-5 text-left transition-all ${
                    isOpen
                      ? "border-green/50 bg-green/5 shadow-lg shadow-green/10"
                      : "border-slate-200 bg-white hover:border-green/30 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-navy">{tech.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-xs text-muted">{tech.desc}</p>
                        <p className="mt-2 text-xs"><span className="font-semibold text-green">Applications:</span> {tech.apps}</p>
                        <p className="mt-1 text-xs"><span className="font-semibold text-blue">Architecture:</span> {tech.arch}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
