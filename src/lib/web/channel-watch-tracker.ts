/**
 * Accrual local + flush batch vers `/api/web/iptv/channel-watch`
 * (miroir web de ChannelWatchRepository Android — pas d’appel réseau par tick).
 */

type Accrual = {
  seconds: number;
  name: string | null;
  logoUrl: string | null;
};

type ChannelMeta = {
  id: string;
  name?: string | null;
  logo?: string | null;
};

const FLUSH_DEBOUNCE_MS = 800;
const TICK_MS = 1000;
const MIN_FLUSH_SECONDS = 3;

let profileId: string | null = null;
let activeId: string | null = null;
let activeMeta: Accrual | null = null;
const pending = new Map<string, Accrual>();
let tickTimer: ReturnType<typeof setInterval> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function finalizeActive() {
  if (!activeId || !activeMeta || activeMeta.seconds <= 0) return;
  const existing = pending.get(activeId) || { seconds: 0, name: activeMeta.name, logoUrl: activeMeta.logoUrl };
  existing.seconds += activeMeta.seconds;
  if (!existing.name) existing.name = activeMeta.name;
  if (!existing.logoUrl) existing.logoUrl = activeMeta.logoUrl;
  pending.set(activeId, existing);
  activeMeta.seconds = 0;
}

function stopTick() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(() => {
    if (activeMeta) activeMeta.seconds += 1;
  }, TICK_MS);
}

async function flushBatch() {
  finalizeActive();
  const pid = profileId?.trim();
  if (!pid || pending.size === 0) return;

  const rows: Array<{
    channel_id: string;
    channel_name: string | null;
    logo_url: string | null;
    watch_seconds: number;
    last_watched_at: string;
  }> = [];

  for (const [id, a] of pending) {
    if (a.seconds < MIN_FLUSH_SECONDS) continue;
    rows.push({
      channel_id: id,
      channel_name: a.name,
      logo_url: a.logoUrl,
      watch_seconds: a.seconds,
      last_watched_at: new Date().toISOString()
    });
  }
  pending.clear();
  if (rows.length === 0) return;

  try {
    await fetch("/api/web/iptv/channel-watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: pid, rows }),
      keepalive: true
    });
  } catch {
    for (const row of rows) {
      const existing = pending.get(row.channel_id) || {
        seconds: 0,
        name: row.channel_name,
        logoUrl: row.logo_url
      };
      existing.seconds += row.watch_seconds;
      pending.set(row.channel_id, existing);
    }
  }
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushBatch();
  }, FLUSH_DEBOUNCE_MS);
}

export function setChannelWatchProfile(id: string | null) {
  if (profileId && profileId !== id) {
    finalizeActive();
    scheduleFlush();
  }
  profileId = id;
}

export function onIptvChannelChanged(channel: ChannelMeta | null) {
  finalizeActive();
  if (!channel?.id) {
    activeId = null;
    activeMeta = null;
    stopTick();
    scheduleFlush();
    return;
  }
  activeId = channel.id;
  activeMeta = {
    seconds: 0,
    name: channel.name?.trim() || null,
    logoUrl: channel.logo?.trim() || null
  };
  startTick();
  scheduleFlush();
}

export function onIptvChannelPausedOrLeft() {
  finalizeActive();
  stopTick();
  scheduleFlush();
}

export function flushIptvChannelWatchNow() {
  void flushBatch();
}
