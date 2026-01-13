import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

// Mock TipTap's useEditor hook
const mockEditor = {
	getHTML: vi.fn(() => "<p>test content</p>"),
	commands: {
		setContent: vi.fn(),
	},
	on: vi.fn(),
	off: vi.fn(),
	destroy: vi.fn(),
};

let onUpdateCallback: ((params: { transaction: { docChanged: boolean } }) => void) | null = null;
let onBlurCallback: (() => void) | null = null;

vi.mock("@tiptap/react", () => ({
	useEditor: vi.fn((config) => {
		// Capture callbacks for testing
		if (config.onUpdate) {
			onUpdateCallback = config.onUpdate;
		}
		if (config.onBlur) {
			onBlurCallback = config.onBlur;
		}
		return mockEditor;
	}),
	EditorContent: vi.fn(({ editor }) => (
		<div data-testid="editor-content">Editor Content</div>
	)),
}));

vi.mock("@tiptap/starter-kit", () => ({
	default: {
		configure: vi.fn(() => ({})),
	},
}));

vi.mock("@tiptap/extension-placeholder", () => ({
	default: {
		configure: vi.fn(() => ({})),
	},
}));

// Import after mocks
import { BrainDumpEditor } from "./brain-dump-editor";

describe("BrainDumpEditor", () => {
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		onUpdateCallback = null;
		onBlurCallback = null;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render the editor", () => {
		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);
		expect(screen.getByTestId("editor-content")).toBeInTheDocument();
	});

	it("should debounce save calls on update", async () => {
		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);

		// Simulate multiple rapid updates with document changes
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: true } });
		});
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: true } });
		});
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: true } });
		});

		// Should not have saved yet (debounce)
		expect(mockOnSave).not.toHaveBeenCalled();

		// Advance time past debounce threshold
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should save only once
		expect(mockOnSave).toHaveBeenCalledTimes(1);
	});

	it("should NOT trigger save when document has not changed", async () => {
		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);

		// Simulate updates where docChanged is false (e.g., selection change)
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: false } });
		});
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: false } });
		});

		// Advance time past debounce
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Should NOT have saved because no actual document changes
		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it("should save immediately on blur", async () => {
		mockEditor.getHTML.mockReturnValue("<p>new content</p>");

		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);

		// Trigger blur
		act(() => {
			onBlurCallback?.();
		});

		// Should save immediately without waiting for debounce
		expect(mockOnSave).toHaveBeenCalledTimes(1);
		expect(mockOnSave).toHaveBeenCalledWith("<p>new content</p>");
	});

	it("should not save on blur if content unchanged", async () => {
		const initialContent = "<p>test content</p>";
		mockEditor.getHTML.mockReturnValue(initialContent);

		render(
			<BrainDumpEditor initialContent={initialContent} onSave={mockOnSave} />
		);

		// Blur when content matches initialContent - should NOT save
		// because lastSavedContentRef is initialized with initialContent
		act(() => {
			onBlurCallback?.();
		});

		expect(mockOnSave).not.toHaveBeenCalled();

		// Now simulate content change
		mockEditor.getHTML.mockReturnValue("<p>changed content</p>");
		act(() => {
			onBlurCallback?.();
		});

		// Should save because content changed
		expect(mockOnSave).toHaveBeenCalledTimes(1);
		expect(mockOnSave).toHaveBeenCalledWith("<p>changed content</p>");

		// Clear and blur again with same content
		mockOnSave.mockClear();
		act(() => {
			onBlurCallback?.();
		});

		// Should not save again since content hasn't changed
		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it("should clear pending debounce timer on blur", async () => {
		mockEditor.getHTML.mockReturnValue("<p>new content</p>");

		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);

		// Start a debounced save
		act(() => {
			onUpdateCallback?.({ transaction: { docChanged: true } });
		});

		// Advance time partially
		act(() => {
			vi.advanceTimersByTime(200);
		});

		// Blur before debounce completes
		act(() => {
			onBlurCallback?.();
		});

		// Should have saved on blur
		expect(mockOnSave).toHaveBeenCalledTimes(1);

		// Clear and advance timer to where debounce would have fired
		mockOnSave.mockClear();
		act(() => {
			vi.advanceTimersByTime(300);
		});

		// Should NOT save again - debounce was cleared
		expect(mockOnSave).not.toHaveBeenCalled();
	});

	it("should handle rapid typing efficiently (stress test)", async () => {
		mockEditor.getHTML
			.mockReturnValueOnce("<p>a</p>")
			.mockReturnValueOnce("<p>ab</p>")
			.mockReturnValueOnce("<p>abc</p>")
			.mockReturnValueOnce("<p>abcd</p>")
			.mockReturnValueOnce("<p>abcde</p>");

		render(<BrainDumpEditor initialContent="" onSave={mockOnSave} />);

		// Simulate 100 rapid keystrokes
		for (let i = 0; i < 100; i++) {
			act(() => {
				onUpdateCallback?.({ transaction: { docChanged: true } });
			});
			// 10ms between each keystroke
			act(() => {
				vi.advanceTimersByTime(10);
			});
		}

		// No saves during typing (debounced)
		expect(mockOnSave).not.toHaveBeenCalled();

		// Wait for debounce to complete
		act(() => {
			vi.advanceTimersByTime(500);
		});

		// Only ONE save call after all typing is done
		expect(mockOnSave).toHaveBeenCalledTimes(1);
	});
});
