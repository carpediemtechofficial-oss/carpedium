import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import QuickEnquiry from "@/components/ui/QuickEnquiry";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

import Hero from "@/components/hero/Hero";
import TrustStrip from "@/components/sections/TrustStrip";
import CourseGrid from "@/components/sections/CourseGrid";
import WhyCarpediem from "@/components/sections/WhyCarpediem";
import Programs from "@/components/sections/Programs";
import HowItWorks from "@/components/sections/HowItWorks";
import LiveProjects from "@/components/sections/LiveProjects";
import Certifications from "@/components/sections/Certifications";
import Mentors from "@/components/sections/Mentors";
import Outcomes from "@/components/sections/Outcomes";
import FAQs from "@/components/sections/FAQs";
import BlogPreview from "@/components/sections/BlogPreview";
import Resources from "@/components/sections/Resources";
import Contact from "@/components/sections/Contact";

import PreLoader from "@/components/ui/PreLoader";
import ScrollProgress from "@/components/ui/ScrollProgress";
import EnrollModal from "@/components/ui/EnrollModal";
import SuccessPage from "@/components/ui/SuccessPage";
import AdminDashboard from "@/components/ui/AdminDashboard";

import SettingsEffects from "@/components/providers/SettingsEffects";

import CoursesPage from "@/components/courses/CoursesPage";
import CourseDetailContainer from "@/components/courses/CourseDetailContainer";

import AboutUsSection from "@/components/sections/AboutUsSection";
import StrategySection from "@/components/sections/StrategySection";
import CollaborationsSection from "@/components/sections/CollaborationsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PartnerLogos from "@/components/sections/PartnerLogos";

import StyleOverrides from "@/editor/StyleOverrides";
import CanvasRuntime from "@/editor/CanvasRuntime";

import { type Course } from "@/data/courses";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://script.google.com/macros/s/AKfycbzf4_Vj066n-X_5ZJ7B2D2V_M73r6yBNDq4-vQ/exec";

type ViewState = "portal" | "admin" | "success" | "courses" | "course-detail";

const queryClient = new QueryClient();

const SECTION_COMPONENTS: Record<string, (props: any) => React.JSX.Element> = {
  hero: () => <Hero />,
  about: () => <AboutUsSection />,
  trust: () => <TrustStrip />,
  courses: (props) => (
    <CourseGrid
      onEnroll={props.onEnroll}
      onViewAll={props.onViewAll}
      onViewDetails={props.onViewDetails}
    />
  ),
  why: () => <WhyCarpediem />,
  strategy: () => <StrategySection />,
  collaborations: () => <CollaborationsSection />,
  programs: () => <Programs />,
  how: () => <HowItWorks />,
  projects: () => <LiveProjects />,
  certifications: () => <Certifications />,
  mentors: () => <Mentors />,
  outcomes: () => <Outcomes />,
  testimonials: () => <TestimonialsSection />,
  partners: () => <PartnerLogos />,
  faqs: () => <FAQs />,
  blog: () => <BlogPreview />,
  resources: () => <Resources />,
  contact: () => <Contact />
};

export default function App() {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>("portal");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [currentCourseSlug, setCurrentCourseSlug] = useState<string>("");

  // Track active section for navbar highlighting (Intersection Observer)
  useEffect(() => {
    if (view !== "portal") return;

    const sections = document.querySelectorAll("section");
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [view]);

  // Disable page scroll when loading or modal open
  useEffect(() => {
    if (loading || isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, isModalOpen]);

  const handleEnrollClick = (course?: Course) => {
    if (course) {
      setSelectedCourseId(course.id);
    }
    setIsModalOpen(true);
  };

  const handleEnrollSuccess = (data: any) => {
    setIsModalOpen(false);
    setRegistrationData(data);
    setView("success");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleViewCourses = () => {
    setView("courses");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleViewCourseDetail = (slug: string) => {
    setView("course-detail");
    setCurrentCourseSlug(slug);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleBackHome = () => {
    setView("portal");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsEffects />
      <StyleOverrides />
      <CanvasRuntime />
      <div className="min-h-full flex flex-col bg-white text-slate-900">
        <PreLoader onComplete={() => setLoading(false)} />

        {view === "admin" ? (
          <AdminDashboard onBackToPortal={() => setView("portal")} />
        ) : (
          <SmoothScrollProvider>
            <ScrollProgress />
            <Nav
              activeSection={activeSection}
              onEnrollClick={() => handleEnrollClick()}
            />
            <main className="flex-1">
              {view === "success" && registrationData ? (
                <SuccessPage
                  regData={registrationData}
                  onBackHome={handleBackHome}
                />
              ) : view === "courses" ? (
                <CoursesPage
                  onViewDetails={handleViewCourseDetail}
                  onEnroll={handleEnrollClick}
                  onBackHome={handleBackHome}
                />
              ) : view === "course-detail" ? (
                <CourseDetailContainer
                  slug={currentCourseSlug}
                  onEnroll={handleEnrollClick}
                  onBack={handleViewCourses}
                  onBackHome={handleBackHome}
                />
              ) : (
                <>
                  {(settings.layout?.sections || []).map((sect: any) => {
                    if (sect.visible === false) return null;
                    const Comp = SECTION_COMPONENTS[sect.id];
                    if (!Comp) return null;
                    return (
                      <span key={sect.id}>
                        {Comp({
                          onEnroll: handleEnrollClick,
                          onViewAll: handleViewCourses,
                          onViewDetails: handleViewCourseDetail
                        })}
                      </span>
                    );
                  })}
                </>
              )}
            </main>
            <Footer onAdminClick={() => setView("admin")} />
            <QuickEnquiry />
            <WhatsAppButton />

            {isModalOpen && (
              <EnrollModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedCourseId={selectedCourseId}
                onSuccess={handleEnrollSuccess}
                backendUrl={BACKEND_URL}
              />
            )}
          </SmoothScrollProvider>
        )}
      </div>
    </QueryClientProvider>
  );
}
