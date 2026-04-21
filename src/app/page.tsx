"use client";
import KanbanBoard from "@/components/KanbanBoard";
import ApplicationDrawer from "@/components/ApplicationDrawer";
import AddApplicationModal from "@/components/AddApplicationModal";

export default function Home() {
  return (
    <>
      <KanbanBoard />
      <ApplicationDrawer />
      <AddApplicationModal />
    </>
  );
}
