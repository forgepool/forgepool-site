import assert from "node:assert/strict";
import test from "node:test";

import {
  initializeNewPublicationBadges,
  isNewPublication,
  NEW_PUBLICATION_WINDOW_MS,
  NEW_PUBLICATION_BADGE_SELECTOR,
  selectBlogHighlights,
  serializePublishedAt,
  updateNewPublicationBadge,
} from "../src/lib/publicationPresentation.mjs";

const PUBLISHED_AT =
  "2026-08-12T08:30:00.000Z";

const PUBLISHED_AT_MS =
  Date.parse(PUBLISHED_AT);

test("fehlendes oder ungültiges publishedAt ist nicht neu", () => {
  assert.equal(
    isNewPublication(undefined, PUBLISHED_AT_MS),
    false,
  );

  assert.equal(
    isNewPublication("kein-zeitpunkt", PUBLISHED_AT_MS),
    false,
  );
});

test("das Neu-Intervall ist exakt [publishedAt, publishedAt + 14 Tage)", () => {
  assert.equal(
    isNewPublication(PUBLISHED_AT, PUBLISHED_AT_MS - 1),
    false,
  );

  assert.equal(
    isNewPublication(PUBLISHED_AT, PUBLISHED_AT_MS),
    true,
  );

  assert.equal(
    isNewPublication(PUBLISHED_AT, PUBLISHED_AT_MS + 7 * 24 * 60 * 60 * 1000),
    true,
  );

  assert.equal(
    isNewPublication(
      PUBLISHED_AT,
      PUBLISHED_AT_MS + NEW_PUBLICATION_WINDOW_MS - 1,
    ),
    true,
  );

  assert.equal(
    isNewPublication(
      PUBLISHED_AT,
      PUBLISHED_AT_MS + NEW_PUBLICATION_WINDOW_MS,
    ),
    false,
  );

  assert.equal(
    isNewPublication(
      PUBLISHED_AT,
      PUBLISHED_AT_MS + NEW_PUBLICATION_WINDOW_MS + 1,
    ),
    false,
  );
});

test("UTC-Zeitpunkte bleiben unabhängig von der lokalen Zeitzone exakt", () => {
  assert.equal(
    PUBLISHED_AT_MS,
    Date.UTC(2026, 7, 12, 8, 30),
  );

  assert.equal(
    serializePublishedAt(
      new Date(PUBLISHED_AT_MS),
    ),
    PUBLISHED_AT,
  );

  assert.equal(
    isNewPublication(
      "2026-08-12T10:30:00.000+02:00",
      PUBLISHED_AT_MS,
    ),
    true,
  );
});

function createBadge(publishedAt) {
  const attributes =
    new Map([
      ["aria-hidden", "true"],
    ]);

  return {
    attributes,
    dataset: {
      publishedAt,
    },
    hidden: true,
    removeAttribute(name) {
      attributes.delete(name);
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };
}

test("das Runtime-Badge wird nur innerhalb des gültigen Fensters sichtbar", () => {
  const current =
    createBadge(PUBLISHED_AT);

  assert.equal(
    current.hidden,
    true,
  );

  assert.equal(
    updateNewPublicationBadge(current, PUBLISHED_AT_MS),
    true,
  );

  assert.equal(
    current.hidden,
    false,
  );

  assert.equal(
    current.attributes.has("aria-hidden"),
    false,
  );

  for (
    const publishedAt
    of [
      undefined,
      "kein-zeitpunkt",
      PUBLISHED_AT,
    ]
  ) {
    const hidden =
      createBadge(publishedAt);

    const now =
      publishedAt === PUBLISHED_AT
        ? PUBLISHED_AT_MS + NEW_PUBLICATION_WINDOW_MS
        : PUBLISHED_AT_MS;

    assert.equal(
      updateNewPublicationBadge(hidden, now),
      false,
    );

    assert.equal(
      hidden.hidden,
      true,
    );

    assert.equal(
      hidden.attributes.get("aria-hidden"),
      "true",
    );
  }
});

function createBadgeRoot(badge) {
  return {
    querySelectorAll(selector) {
      assert.equal(
        selector,
        NEW_PUBLICATION_BADGE_SELECTOR,
      );

      return [badge];
    },
  };
}

function createFakeScheduler(initialNow) {
  let currentNow =
    initialNow;

  let nextHandle =
    1;

  const clearedHandles =
    [];

  const timers =
    new Map();

  const scheduler = {
    clearTimeout(handle) {
      clearedHandles.push(
        handle,
      );

      timers.delete(
        handle,
      );
    },
    now() {
      return currentNow;
    },
    setTimeout(callback, delay) {
      const handle =
        nextHandle++;

      timers.set(
        handle,
        {
          callback,
          scheduledFor:
            currentNow + delay,
        },
      );

      return handle;
    },
  };

  return {
    clearedHandles,
    runNextAt(now) {
      assert.equal(
        timers.size,
        1,
      );

      const [
        handle,
        timer,
      ] = timers.entries().next().value;

      assert.equal(
        timer.scheduledFor,
        now,
      );

      timers.delete(
        handle,
      );

      currentNow =
        now;

      timer.callback();
    },
    scheduler,
    timers,
  };
}

function getOnlyTimer(timers) {
  assert.equal(
    timers.size,
    1,
  );

  return timers.values().next().value;
}

test("ein bereits neues Badge plant exakt seinen Ablauf und wird dann verborgen", () => {
  const expiresAt =
    PUBLISHED_AT_MS +
    NEW_PUBLICATION_WINDOW_MS;

  const now =
    PUBLISHED_AT_MS +
    60_000;

  const badge =
    createBadge(PUBLISHED_AT);

  const fake =
    createFakeScheduler(now);

  initializeNewPublicationBadges(
    createBadgeRoot(badge),
    fake.scheduler,
  );

  assert.equal(
    badge.hidden,
    false,
  );

  assert.equal(
    badge.attributes.has("aria-hidden"),
    false,
  );

  assert.equal(
    getOnlyTimer(fake.timers).scheduledFor,
    expiresAt,
  );

  fake.runNextAt(
    expiresAt,
  );

  assert.equal(
    badge.hidden,
    true,
  );

  assert.equal(
    badge.attributes.get("aria-hidden"),
    "true",
  );

  assert.equal(
    fake.timers.size,
    0,
  );
});

test("ein zukünftiges Badge plant Veröffentlichung und danach Ablauf", () => {
  const expiresAt =
    PUBLISHED_AT_MS +
    NEW_PUBLICATION_WINDOW_MS;

  const badge =
    createBadge(PUBLISHED_AT);

  const fake =
    createFakeScheduler(
      PUBLISHED_AT_MS - 60_000,
    );

  initializeNewPublicationBadges(
    createBadgeRoot(badge),
    fake.scheduler,
  );

  assert.equal(
    badge.hidden,
    true,
  );

  assert.equal(
    getOnlyTimer(fake.timers).scheduledFor,
    PUBLISHED_AT_MS,
  );

  fake.runNextAt(
    PUBLISHED_AT_MS,
  );

  assert.equal(
    badge.hidden,
    false,
  );

  assert.equal(
    badge.attributes.has("aria-hidden"),
    false,
  );

  assert.equal(
    getOnlyTimer(fake.timers).scheduledFor,
    expiresAt,
  );
});

test("fehlende oder ungültige Zeitpunkte planen keinen Übergang", () => {
  for (
    const publishedAt
    of [
      undefined,
      "kein-zeitpunkt",
    ]
  ) {
    const badge =
      createBadge(publishedAt);

    const fake =
      createFakeScheduler(
        PUBLISHED_AT_MS,
      );

    initializeNewPublicationBadges(
      createBadgeRoot(badge),
      fake.scheduler,
    );

    assert.equal(
      badge.hidden,
      true,
    );

    assert.equal(
      badge.attributes.get("aria-hidden"),
      "true",
    );

    assert.equal(
      fake.timers.size,
      0,
    );
  }
});

test("ein bereits abgelaufenes Badge plant keinen Übergang", () => {
  const badge =
    createBadge(PUBLISHED_AT);

  const fake =
    createFakeScheduler(
      PUBLISHED_AT_MS +
        NEW_PUBLICATION_WINDOW_MS,
    );

  initializeNewPublicationBadges(
    createBadgeRoot(badge),
    fake.scheduler,
  );

  assert.equal(
    badge.hidden,
    true,
  );

  assert.equal(
    badge.attributes.get("aria-hidden"),
    "true",
  );

  assert.equal(
    fake.timers.size,
    0,
  );
});

test("erneute Initialisierung ersetzt den bestehenden Badge-Timer", () => {
  const badge =
    createBadge(PUBLISHED_AT);

  const root =
    createBadgeRoot(badge);

  const fake =
    createFakeScheduler(
      PUBLISHED_AT_MS,
    );

  initializeNewPublicationBadges(
    root,
    fake.scheduler,
  );

  const firstHandle =
    fake.timers.keys().next().value;

  initializeNewPublicationBadges(
    root,
    fake.scheduler,
  );

  assert.deepEqual(
    fake.clearedHandles,
    [firstHandle],
  );

  assert.equal(
    fake.timers.size,
    1,
  );

  assert.equal(
    fake.timers.has(firstHandle),
    false,
  );
});

function post(title, featured) {
  return {
    data: {
      featured,
    },
    title,
  };
}

test("echte Featured-Beiträge werden exklusiv hervorgehoben", () => {
  const result =
    selectBlogHighlights([
      post("Neuester normaler Beitrag", false),
      post("Editorial ausgewählt", true),
      post("Weiterer normaler Beitrag", false),
    ]);

  assert.equal(
    result.kind,
    "featured",
  );

  assert.equal(
    result.heading,
    "Ausgewählte Updates",
  );

  assert.deepEqual(
    result.posts.map(({ title }) => title),
    ["Editorial ausgewählt"],
  );
});

test("ohne echte Featured-Beiträge bleibt der Fallback neutral und sortiert", () => {
  const result =
    selectBlogHighlights([
      post("Neuester Beitrag", false),
      post("Zweitneuester Beitrag", false),
      post("Drittneuester Beitrag", false),
      post("Älterer Beitrag", false),
    ]);

  assert.equal(
    result.kind,
    "latest",
  );

  assert.equal(
    result.heading,
    "Aktuelle Updates",
  );

  assert.deepEqual(
    result.posts.map(({ title }) => title),
    [
      "Neuester Beitrag",
      "Zweitneuester Beitrag",
      "Drittneuester Beitrag",
    ],
  );
});
