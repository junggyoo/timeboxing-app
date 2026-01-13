"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useCallback, memo } from "react";

type BrainDumpEditorProps = {
	initialContent: string;
	onSave: (content: string) => void;
};

function BrainDumpEditorComponent({
	initialContent,
	onSave,
}: BrainDumpEditorProps) {
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSavedContentRef = useRef(initialContent);
	const isExternalUpdate = useRef(false);
	const editorRef = useRef<Editor | null>(null);
	const onSaveRef = useRef(onSave);

	// Keep onSave ref up to date without causing re-renders
	useEffect(() => {
		onSaveRef.current = onSave;
	}, [onSave]);

	const saveCurrentContent = useCallback(() => {
		if (!editorRef.current) return;
		const html = editorRef.current.getHTML();
		if (html !== lastSavedContentRef.current) {
			lastSavedContentRef.current = html;
			onSaveRef.current(html);
		}
	}, []);

	const scheduleSave = useCallback(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}
		debounceTimerRef.current = setTimeout(saveCurrentContent, 500);
	}, [saveCurrentContent]);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3, 4],
				},
			}),
			Placeholder.configure({
				placeholder:
					"생각을 자유롭게 적어보세요. 아이디어, 할 일, 메모 등 무엇이든 괜찮아요.",
			}),
		],
		content: initialContent,
		immediatelyRender: false,
		shouldRerenderOnTransaction: false,
		editorProps: {
			attributes: {
				class: "brain-dump-prose focus:outline-none min-h-[300px]",
			},
		},
		onUpdate: ({ transaction }) => {
			// Only schedule save if document actually changed (not just cursor/selection)
			if (!isExternalUpdate.current && transaction.docChanged) {
				scheduleSave();
			}
		},
		onBlur: () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
				debounceTimerRef.current = null;
			}
			saveCurrentContent();
		},
	});

	// Store editor ref
	useEffect(() => {
		editorRef.current = editor;
	}, [editor]);

	// Sync with external content changes
	useEffect(() => {
		if (editor && initialContent !== lastSavedContentRef.current) {
			isExternalUpdate.current = true;
			editor.commands.setContent(initialContent);
			lastSavedContentRef.current = initialContent;
			isExternalUpdate.current = false;
		}
	}, [initialContent, editor]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="brain-dump-editor">
			<EditorContent editor={editor} />
		</div>
	);
}

export const BrainDumpEditor = memo(BrainDumpEditorComponent);
