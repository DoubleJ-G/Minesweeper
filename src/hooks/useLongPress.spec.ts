import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLongPress } from "./useLongPress";
import type React from "react";

const mockTouchEvent = (): React.TouchEvent =>
  ({ preventDefault: vi.fn() }) as unknown as React.TouchEvent;

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires the callback after the specified duration", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledOnce();
  });

  it("does not fire if touch ends before the duration elapses", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(100);
      result.current.onTouchEnd(mockTouchEvent());
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not fire if touch moves before the duration elapses", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(100);
      result.current.onTouchMove();
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not fire if touch is cancelled before the duration elapses", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(100);
      result.current.onTouchCancel();
      vi.advanceTimersByTime(200);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls preventDefault on touchEnd when the long press fired", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));
    const event = mockTouchEvent();

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(200);
      result.current.onTouchEnd(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("does not call preventDefault on touchEnd when the long press did not fire", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback, 200));
    const event = mockTouchEvent();

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(100);
      result.current.onTouchEnd(event);
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("is safe to cancel when no touch is in progress", () => {
    const { result } = renderHook(() => useLongPress(vi.fn(), 200));
    expect(() => {
      act(() => {
        result.current.onTouchCancel();
      });
    }).not.toThrow();
  });

  it("defaults to a 200ms duration", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback));

    act(() => {
      result.current.onTouchStart();
      vi.advanceTimersByTime(199);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledOnce();
  });
});
