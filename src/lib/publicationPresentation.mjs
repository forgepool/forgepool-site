export const NEW_PUBLICATION_WINDOW_MS =
  14 * 24 * 60 * 60 * 1000;

export const NEW_PUBLICATION_BADGE_SELECTOR =
  "[data-new-publication-badge]";

const MAX_TIMEOUT_DELAY_MS =
  2_147_483_647;

const scheduledBadgeTransitions =
  new WeakMap();

function toTimestamp(value) {
  if (value instanceof Date) {
    return value.valueOf();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return Date.parse(value);
  }

  return Number.NaN;
}

export function serializePublishedAt(publishedAt) {
  const timestamp =
    toTimestamp(publishedAt);

  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : undefined;
}

export function isNewPublication(
  publishedAt,
  now = Date.now(),
) {
  return getNewPublicationState(
    publishedAt,
    now,
  ).visible;
}

export function getNewPublicationState(
  publishedAt,
  now = Date.now(),
) {
  const publishedAtTimestamp =
    toTimestamp(publishedAt);

  const nowTimestamp =
    toTimestamp(now);

  if (
    !Number.isFinite(publishedAtTimestamp) ||
    !Number.isFinite(nowTimestamp)
  ) {
    return {
      nextTransitionAt: undefined,
      visible: false,
    };
  }

  const expiresAt =
    publishedAtTimestamp +
    NEW_PUBLICATION_WINDOW_MS;

  if (nowTimestamp < publishedAtTimestamp) {
    return {
      nextTransitionAt: publishedAtTimestamp,
      visible: false,
    };
  }

  if (nowTimestamp < expiresAt) {
    return {
      nextTransitionAt: expiresAt,
      visible: true,
    };
  }

  return {
    nextTransitionAt: undefined,
    visible: false,
  };
}

export function updateNewPublicationBadge(
  badge,
  now = Date.now(),
) {
  const visible =
    isNewPublication(
      badge.dataset.publishedAt,
      now,
    );

  badge.hidden =
    !visible;

  if (visible) {
    badge.removeAttribute(
      "aria-hidden",
    );
  } else {
    badge.setAttribute(
      "aria-hidden",
      "true",
    );
  }

  return visible;
}

function clearScheduledBadgeTransition(badge) {
  const scheduledTransition =
    scheduledBadgeTransitions.get(
      badge,
    );

  if (!scheduledTransition) {
    return;
  }

  scheduledTransition.clearTimeout(
    scheduledTransition.handle,
  );

  scheduledBadgeTransitions.delete(
    badge,
  );
}

function synchronizeNewPublicationBadge(
  badge,
  runtime,
) {
  clearScheduledBadgeTransition(
    badge,
  );

  const now =
    runtime.now();

  const state =
    getNewPublicationState(
      badge.dataset.publishedAt,
      now,
    );

  updateNewPublicationBadge(
    badge,
    now,
  );

  if (
    state.nextTransitionAt === undefined
  ) {
    return;
  }

  const delay =
    Math.min(
      Math.max(
        state.nextTransitionAt - now,
        0,
      ),
      MAX_TIMEOUT_DELAY_MS,
    );

  const scheduledTransition = {
    clearTimeout:
      runtime.clearTimeout,
    handle:
      undefined,
  };

  scheduledBadgeTransitions.set(
    badge,
    scheduledTransition,
  );

  scheduledTransition.handle =
    runtime.setTimeout(
      () => {
        if (
          scheduledBadgeTransitions.get(
            badge,
          ) !== scheduledTransition
        ) {
          return;
        }

        scheduledBadgeTransitions.delete(
          badge,
        );

        synchronizeNewPublicationBadge(
          badge,
          runtime,
        );
      },
      delay,
    );
}

export function initializeNewPublicationBadges(
  root = document,
  scheduler = {},
) {
  const runtime = {
    clearTimeout:
      scheduler.clearTimeout ??
      ((handle) => globalThis.clearTimeout(handle)),
    now:
      scheduler.now ??
      (() => Date.now()),
    setTimeout:
      scheduler.setTimeout ??
      ((callback, delay) =>
        globalThis.setTimeout(callback, delay)),
  };

  for (
    const badge
    of root.querySelectorAll(
      NEW_PUBLICATION_BADGE_SELECTOR,
    )
  ) {
    synchronizeNewPublicationBadge(
      badge,
      runtime,
    );
  }
}

export function selectBlogHighlights(
  posts,
  limit = 3,
) {
  const featuredPosts =
    posts
      .filter(
        (post) =>
          post.data.featured === true,
      )
      .slice(0, limit);

  if (featuredPosts.length > 0) {
    return {
      heading:
        "Ausgewählte Updates",
      kind:
        "featured",
      posts:
        featuredPosts,
    };
  }

  return {
    heading:
      "Aktuelle Updates",
    kind:
      "latest",
    posts:
      posts.slice(0, limit),
  };
}
