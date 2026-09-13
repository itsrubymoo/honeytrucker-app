"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { TextInput, Textarea, Select, Field } from "@/components/ui/form";
import {
  createModule,
  renameModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/lib/courses/admin-actions";
import type { CourseLesson, CourseModule } from "@/lib/types/database";

interface ContentOption {
  id: string;
  title: string;
  type: string;
}

export function CourseBuilder({
  courseId,
  modules,
  lessonsByModule,
  contentOptions,
}: {
  courseId: string;
  modules: CourseModule[];
  lessonsByModule: Record<string, CourseLesson[]>;
  contentOptions: ContentOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [orderedModuleIds, setOrderedModuleIds] = useState(modules.map((m) => m.id));
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const orderedModules = orderedModuleIds
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is CourseModule => Boolean(m));

  function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedModuleIds.indexOf(String(active.id));
    const newIndex = orderedModuleIds.indexOf(String(over.id));
    const next = arrayMove(orderedModuleIds, oldIndex, newIndex);
    setOrderedModuleIds(next);
    startTransition(async () => {
      await reorderModules(courseId, next);
      router.refresh();
    });
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    await createModule(courseId, newModuleTitle.trim());
    setNewModuleTitle("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
        <SortableContext items={orderedModuleIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-4">
            {orderedModules.map((mod) => (
              <ModuleBlock
                key={mod.id}
                courseId={courseId}
                module={mod}
                lessons={lessonsByModule[mod.id] ?? []}
                contentOptions={contentOptions}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 p-3">
        <TextInput
          placeholder="new module title"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
        />
        <Button type="button" variant="secondary" onClick={handleAddModule}>
          add module
        </Button>
      </div>
    </div>
  );
}

function ModuleBlock({
  courseId,
  module: mod,
  lessons,
  contentOptions,
}: {
  courseId: string;
  module: CourseModule;
  lessons: CourseLesson[];
  contentOptions: ContentOption[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: mod.id });
  const router = useRouter();
  const [title, setTitle] = useState(mod.title);
  const [orderedLessonIds, setOrderedLessonIds] = useState(lessons.map((l) => l.id));
  const [addingLesson, setAddingLesson] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const orderedLessons = orderedLessonIds
    .map((id) => lessons.find((l) => l.id === id))
    .filter((l): l is CourseLesson => Boolean(l));

  const style = { transform: CSS.Transform.toString(transform), transition };

  function handleLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedLessonIds.indexOf(String(active.id));
    const newIndex = orderedLessonIds.indexOf(String(over.id));
    const next = arrayMove(orderedLessonIds, oldIndex, newIndex);
    setOrderedLessonIds(next);
    reorderLessons(courseId, next).then(() => router.refresh());
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab select-none text-stone-400"
          aria-label="drag to reorder module"
        >
          ⠿
        </button>
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== mod.title && renameModule(courseId, mod.id, title).then(() => router.refresh())}
          className="flex-1 font-medium"
        />
        <form action={deleteModule.bind(null, courseId, mod.id)}>
          <Button type="submit" variant="danger">
            delete module
          </Button>
        </form>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
        <SortableContext items={orderedLessonIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 pl-6">
            {orderedLessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                courseId={courseId}
                lesson={lesson}
                contentOptions={contentOptions}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {addingLesson ? (
        <div className="mt-3 pl-6">
          <LessonForm
            courseId={courseId}
            moduleId={mod.id}
            contentOptions={contentOptions}
            onDone={() => setAddingLesson(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingLesson(true)}
          className="mt-3 pl-6 text-sm text-amber-800 hover:underline"
        >
          + add lesson
        </button>
      )}
    </div>
  );
}

function LessonRow({
  courseId,
  lesson,
  contentOptions,
}: {
  courseId: string;
  lesson: CourseLesson;
  contentOptions: ContentOption[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const [editing, setEditing] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition };

  if (editing) {
    return (
      <div ref={setNodeRef} style={style} className="rounded-md border border-stone-200 p-3">
        <LessonForm
          courseId={courseId}
          moduleId={lesson.module_id}
          lesson={lesson}
          contentOptions={contentOptions}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-md border border-stone-200 px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab select-none text-stone-400"
          aria-label="drag to reorder lesson"
        >
          ⠿
        </button>
        <span className="text-sm text-stone-900">{lesson.title}</span>
        {lesson.tier ? (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{lesson.tier}</span>
        ) : (
          <span className="text-xs text-stone-400">inherits course tier</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
          edit
        </Button>
        <form action={deleteLesson.bind(null, courseId, lesson.id)}>
          <Button type="submit" variant="danger">
            delete
          </Button>
        </form>
      </div>
    </div>
  );
}

function LessonForm({
  courseId,
  moduleId,
  lesson,
  contentOptions,
  onDone,
}: {
  courseId: string;
  moduleId: string;
  lesson?: CourseLesson;
  contentOptions: ContentOption[];
  onDone: () => void;
}) {
  const router = useRouter();

  async function action(formData: FormData) {
    if (lesson) {
      await updateLesson(courseId, lesson.id, formData);
    } else {
      await createLesson(courseId, moduleId, formData);
    }
    router.refresh();
    onDone();
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <Field label="title" htmlFor={`title-${lesson?.id ?? "new"}`}>
        <TextInput id={`title-${lesson?.id ?? "new"}`} name="title" required defaultValue={lesson?.title} />
      </Field>
      <Field label="slug" htmlFor={`slug-${lesson?.id ?? "new"}`}>
        <TextInput id={`slug-${lesson?.id ?? "new"}`} name="slug" required defaultValue={lesson?.slug} pattern="[a-z0-9-]+" />
      </Field>
      <Field label="tier override" htmlFor={`tier-${lesson?.id ?? "new"}`} hint="leave blank to inherit the course tier">
        <Select id={`tier-${lesson?.id ?? "new"}`} name="tier" defaultValue={lesson?.tier ?? ""}>
          <option value="">inherit course tier</option>
          <option value="free">free</option>
          <option value="member">member</option>
        </Select>
      </Field>
      <Field label="linked audio/video" htmlFor={`content-${lesson?.id ?? "new"}`} hint="optional">
        <Select id={`content-${lesson?.id ?? "new"}`} name="content_item_id" defaultValue={lesson?.content_item_id ?? ""}>
          <option value="">none</option>
          {contentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              [{opt.type}] {opt.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="body" htmlFor={`body-${lesson?.id ?? "new"}`} hint="markdown/plain text lesson content, optional">
        <Textarea id={`body-${lesson?.id ?? "new"}`} name="body" rows={4} defaultValue={lesson?.body ?? ""} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">{lesson ? "save lesson" : "add lesson"}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          cancel
        </Button>
      </div>
    </form>
  );
}
