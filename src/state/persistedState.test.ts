import { beforeEach, describe, expect, it } from "vitest";
import { createPersistedState } from "./persistedState";

interface Shape {
  count: number;
  label: string;
}

describe("createPersistedState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing has been stored yet", () => {
    const state = createPersistedState<Shape>("test.key.v1");
    expect(state.get()).toBeNull();
  });

  it("persists a value under the given key and reads it back", () => {
    const state = createPersistedState<Shape>("test.key.v1");
    state.set({ count: 1, label: "a" });
    expect(state.get()).toEqual({ count: 1, label: "a" });
    expect(JSON.parse(window.localStorage.getItem("test.key.v1")!)).toEqual({
      count: 1,
      label: "a",
    });
  });

  it("overwrites a previously stored value", () => {
    const state = createPersistedState<Shape>("test.key.v1");
    state.set({ count: 1, label: "a" });
    state.set({ count: 2, label: "b" });
    expect(state.get()).toEqual({ count: 2, label: "b" });
  });

  it("removes the stored value on clear", () => {
    const state = createPersistedState<Shape>("test.key.v1");
    state.set({ count: 1, label: "a" });
    state.clear();
    expect(state.get()).toBeNull();
    expect(window.localStorage.getItem("test.key.v1")).toBeNull();
  });

  it("does not leak between different keys", () => {
    const a = createPersistedState<Shape>("test.a.v1");
    const b = createPersistedState<Shape>("test.b.v1");
    a.set({ count: 1, label: "a" });
    expect(b.get()).toBeNull();
  });

  it("returns null instead of throwing when stored JSON is corrupted", () => {
    window.localStorage.setItem("test.key.v1", "{not json");
    const state = createPersistedState<Shape>("test.key.v1");
    expect(state.get()).toBeNull();
  });
});
