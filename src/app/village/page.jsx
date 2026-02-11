'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Home, MessageCircle, PartyPopper, Sparkles, Star, Sun, TrendingUp, Users, Zap } from 'lucide-react';

// Mood options for daily check-in
const MOOD_OPTIONS = [
  { id: 'joyful', label: 'Joyful', emoji: '😊', color: '#FFD700', effect: 'joy' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#87CEEB', effect: 'peace' },
  { id: 'energized', label: 'Energized', emoji: '⚡', color: '#FF6347', effect: 'energy' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏', color: '#98FB98', effect: 'gratitude' },
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: '#FFA07A', effect: 'stress' },
  { id: 'lonely', label: 'Lonely', emoji: '😔', color: '#B0C4DE', effect: 'lonely' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌟', color: '#FFB6C1', effect: 'hope' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😫', color: '#DDA0DD', effect: 'overwhelm' }
];

// Coping tips that users can share
const COPING_TIPS = [
  "Take 3 deep breaths and count to 10",
  "Go for a 5-minute walk outside",
  "Write down 3 things you're grateful for",
  "Call or text a friend",
  "Listen to your favorite song",
  "Do 10 jumping jacks to release energy",
  "Draw or doodle for a few minutes",
  "Make yourself a warm beverage",
  "Watch a funny video",
  "Stretch your body gently"
];

// Village buildings that grow with engagement
const BUILDINGS = [
  {
    id: 'wellness-center',
    name: 'Wellness Center',
    image: '/village/wellness-center.svg',
    level: 0,
    maxLevel: 5,
    spot: { left: '14%', top: '18%' },
    tone: 'from-amber-200 to-orange-200'
  },
  {
    id: 'community-hall',
    name: 'Community Hall',
    image: '/village/community-hall.svg',
    level: 0,
    maxLevel: 5,
    spot: { left: '58%', top: '12%' },
    tone: 'from-sky-200 to-blue-200'
  },
  {
    id: 'peace-garden',
    name: 'Peace Garden',
    image: '/village/peace-garden.svg',
    level: 0,
    maxLevel: 5,
    spot: { left: '20%', top: '56%' },
    tone: 'from-emerald-200 to-lime-200'
  },
  {
    id: 'cafe',
    name: 'Support Cafe',
    image: '/village/cafe.svg',
    level: 0,
    maxLevel: 5,
    spot: { left: '62%', top: '58%' },
    tone: 'from-rose-200 to-pink-200'
  }
];

export default function VillagePage() {
  const [loading, setLoading] = useState(true);
  const villageMapRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Inject keyframe animations into the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      

      
      @keyframes shimmer {
        0% {
          background-position: -1000px 0;
        }
        100% {
          background-position: 1000px 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  // Village state
  const [villageData, setVillageData] = useState({
    buildings: BUILDINGS,
    totalCheckIns: 0,
    activeEvent: null,
    communityTips: [],
    gratitudePosts: [],
    supportRequests: [],
    moodCounts: {},
    villagers: []
  });
  
  // User state
  const [userStats, setUserStats] = useState({
    checkInStreak: 0,
    lastCheckIn: null,
    tipsShared: 0,
    connectionsHelped: 0,
    eventsJoined: 0
  });
  
  // UI state
  const [selectedMood, setSelectedMood] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showTipShare, setShowTipShare] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [customTip, setCustomTip] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [supportText, setSupportText] = useState('');
  const [userName, setUserName] = useState('');
  const [animation, setAnimation] = useState('');

  // Load village data on mount
  useEffect(() => {
    loadVillageData();
  }, []);

  const loadVillageData = async () => {
    try {
      // Load shared village data
      const villageResult = await window.storage.get('village-data', true);
      if (villageResult && villageResult.value) {
        setVillageData(JSON.parse(villageResult.value));
      }
      
      // Load personal stats
      const statsResult = await window.storage.get('user-village-stats', false);
      if (statsResult && statsResult.value) {
        setUserStats(JSON.parse(statsResult.value));
      }
    } catch (error) {
      console.log('Starting fresh village');
    } finally {
      setLoading(false);
    }
  };

  const saveVillageData = async (data) => {
    try {
      if (typeof window === 'undefined' || !window.storage?.set) {
        return;
      }
      await window.storage.set('village-data', JSON.stringify(data), true);
    } catch (error) {
      console.error('Failed to save village data:', error);
    }
  };

  const saveUserStats = async (stats) => {
    try {
      if (typeof window === 'undefined' || !window.storage?.set) {
        return;
      }
      await window.storage.set('user-village-stats', JSON.stringify(stats), false);
    } catch (error) {
      console.error('Failed to save user stats:', error);
    }
  };

  const startBuildingDrag = (event, building, spot) => {
    if (!villageMapRef.current) return;
    event.preventDefault();

    const rect = villageMapRef.current.getBoundingClientRect();
    const currentLeft = (parseFloat(spot.left) / 100) * rect.width;
    const currentTop = (parseFloat(spot.top) / 100) * rect.height;
    const offsetX = event.clientX - rect.left - currentLeft;
    const offsetY = event.clientY - rect.top - currentTop;

    setDraggingId(building.id);
    setDragOffset({ x: offsetX, y: offsetY });

    if (event.currentTarget?.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const moveBuilding = (event) => {
    if (!draggingId || !villageMapRef.current) return;

    const rect = villageMapRef.current.getBoundingClientRect();
    const rawX = event.clientX - rect.left - dragOffset.x;
    const rawY = event.clientY - rect.top - dragOffset.y;
    const clampedX = Math.min(Math.max(rawX, 0), rect.width);
    const clampedY = Math.min(Math.max(rawY, 0), rect.height);
    const left = `${(clampedX / rect.width) * 100}%`;
    const top = `${(clampedY / rect.height) * 100}%`;

    setVillageData((prev) => ({
      ...prev,
      buildings: prev.buildings.map((item) =>
        item.id === draggingId ? { ...item, spot: { left, top } } : item
      )
    }));
  };

  const endBuildingDrag = () => {
    if (!draggingId) return;
    setDraggingId(null);
    setDragOffset({ x: 0, y: 0 });
    setVillageData((prev) => {
      saveVillageData(prev);
      return prev;
    });
  };

  // Check if user can check in today
  const canCheckInToday = () => {
    if (!userStats.lastCheckIn) return true;
    const lastCheckIn = new Date(userStats.lastCheckIn);
    const today = new Date();
    return lastCheckIn.toDateString() !== today.toDateString();
  };

  // Handle daily mood check-in
  const handleMoodCheckIn = async (mood) => {
    if (!userName.trim()) {
      alert('Please enter your name first!');
      return;
    }

    // Trigger village animation
    setAnimation(mood.effect);
    setTimeout(() => setAnimation(''), 2000);

    // Update mood counts
    const newMoodCounts = { ...villageData.moodCounts };
    newMoodCounts[mood.id] = (newMoodCounts[mood.id] || 0) + 1;

    // Add villager representation
    const newVillager = {
      id: Date.now(),
      name: userName,
      mood: mood.id,
      timestamp: Date.now()
    };

    // Grow a random building
    const newBuildings = [...villageData.buildings];
    const randomBuilding = newBuildings[Math.floor(Math.random() * newBuildings.length)];
    const oldLevel = randomBuilding.level;
    if (randomBuilding.level < randomBuilding.maxLevel) {
      randomBuilding.level += 1;
      // Trigger special animation when building levels up
      if (randomBuilding.level !== oldLevel) {
        setAnimation('building-grow');
        setTimeout(() => setAnimation(''), 1500);
      }
    }

    // Check for community event trigger
    const newEvent = checkForEvent(newMoodCounts, villageData.totalCheckIns + 1);

    const updatedVillage = {
      ...villageData,
      buildings: newBuildings,
      totalCheckIns: villageData.totalCheckIns + 1,
      moodCounts: newMoodCounts,
      villagers: [...villageData.villagers, newVillager].slice(-20), // Keep last 20
      activeEvent: newEvent || villageData.activeEvent
    };

    // Update user stats
    const newUserStats = {
      ...userStats,
      checkInStreak: calculateStreak(userStats.lastCheckIn),
      lastCheckIn: Date.now(),
      eventsJoined: newEvent ? userStats.eventsJoined + 1 : userStats.eventsJoined
    };

    setVillageData(updatedVillage);
    setUserStats(newUserStats);
    await saveVillageData(updatedVillage);
    await saveUserStats(newUserStats);

    setShowCheckIn(false);
    setSelectedMood(null);
  };

  // Calculate check-in streak
  const calculateStreak = (lastCheckIn) => {
    if (!lastCheckIn) return 1;
    const last = new Date(lastCheckIn);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (last.toDateString() === yesterday.toDateString()) {
      return userStats.checkInStreak + 1;
    }
    return 1;
  };

  // Determine if a community event should trigger
  const checkForEvent = (moodCounts, totalCheckIns) => {
    if (totalCheckIns < 5) return null; // Need minimum participation

    const stressCount = (moodCounts.stressed || 0) + (moodCounts.overwhelmed || 0);
    const joyCount = (moodCounts.joyful || 0) + (moodCounts.energized || 0);
    const gratefulCount = (moodCounts.grateful || 0) + (moodCounts.hopeful || 0);
    const lonelyCount = moodCounts.lonely || 0;

    // Event triggers based on aggregate mood
    if (stressCount > totalCheckIns * 0.4) {
      return {
        id: 'stress-festival',
        name: '🎪 Stress Relief Festival',
        description: 'The village noticed high stress levels. Join us for relaxation activities!',
        icon: PartyPopper,
        color: '#FF6B9D'
      };
    }
    
    if (gratefulCount > totalCheckIns * 0.5) {
      return {
        id: 'gratitude-gala',
        name: '✨ Gratitude Gala',
        description: 'So much gratitude in the air! Let\'s celebrate our blessings together.',
        icon: Sparkles,
        color: '#FFD700'
      };
    }
    
    if (joyCount > totalCheckIns * 0.6) {
      return {
        id: 'joy-celebration',
        name: '🎉 Joy Celebration',
        description: 'The village is radiating positive energy! Dance party time!',
        icon: Star,
        color: '#00CED1'
      };
    }
    
    if (lonelyCount > totalCheckIns * 0.3) {
      return {
        id: 'connection-circle',
        name: '🤝 Connection Circle',
        description: 'Let\'s come together and support each other. You\'re not alone!',
        icon: Users,
        color: '#9370DB'
      };
    }

    return null;
  };

  // Share a coping tip
  const shareCopingTip = async (tip) => {
    if (!userName.trim()) {
      const name = prompt("What's your name?");
      if (!name) return;
      setUserName(name);
    }

    const newTip = {
      id: Date.now(),
      author: userName || 'Anonymous',
      tip: tip || customTip,
      timestamp: Date.now(),
      boosts: 0
    };

    // Grow community hall when tips are shared
    const newBuildings = [...villageData.buildings];
    const communityHall = newBuildings.find(b => b.id === 'community-hall');
    if (communityHall && communityHall.level < communityHall.maxLevel) {
      communityHall.level += 1;
    }

    const updatedVillage = {
      ...villageData,
      buildings: newBuildings,
      communityTips: [newTip, ...villageData.communityTips].slice(0, 15)
    };

    const newUserStats = {
      ...userStats,
      tipsShared: userStats.tipsShared + 1
    };

    setVillageData(updatedVillage);
    setUserStats(newUserStats);
    await saveVillageData(updatedVillage);
    await saveUserStats(newUserStats);

    setShowTipShare(false);
    setCustomTip('');
    setAnimation('sparkle');
    setTimeout(() => setAnimation(''), 2000);
  };

  // Post gratitude
  const postGratitude = async () => {
    if (!userName.trim()) {
      const name = prompt("What's your name?");
      if (!name) return;
      setUserName(name);
    }

    if (!gratitudeText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: userName || 'Anonymous',
      text: gratitudeText,
      timestamp: Date.now(),
      hearts: 0
    };

    const newBuildings = [...villageData.buildings];
    const garden = newBuildings.find(b => b.id === 'peace-garden');
    if (garden && garden.level < garden.maxLevel) {
      garden.level += 1;
    }

    const updatedVillage = {
      ...villageData,
      buildings: newBuildings,
      gratitudePosts: [newPost, ...villageData.gratitudePosts].slice(0, 15)
    };

    setVillageData(updatedVillage);
    await saveVillageData(updatedVillage);

    setShowGratitude(false);
    setGratitudeText('');
    setAnimation('gratitude');
    setTimeout(() => setAnimation(''), 2000);
  };

  // Post support request
  const postSupportRequest = async () => {
    if (!userName.trim()) {
      const name = prompt("What's your name?");
      if (!name) return;
      setUserName(name);
    }

    if (!supportText.trim()) return;

    const newRequest = {
      id: Date.now(),
      author: userName || 'Anonymous',
      text: supportText,
      timestamp: Date.now(),
      responses: []
    };

    const newBuildings = [...villageData.buildings];
    const wellness = newBuildings.find(b => b.id === 'wellness-center');
    if (wellness && wellness.level < wellness.maxLevel) {
      wellness.level += 1;
    }

    const updatedVillage = {
      ...villageData,
      buildings: newBuildings,
      supportRequests: [newRequest, ...villageData.supportRequests].slice(0, 15)
    };

    setVillageData(updatedVillage);
    await saveVillageData(updatedVillage);

    setShowSupport(false);
    setSupportText('');
    setAnimation('hope');
    setTimeout(() => setAnimation(''), 2000);
  };

  // Boost a tip
  const boostTip = async (tipId) => {
    const updatedTips = villageData.communityTips.map(tip => 
      tip.id === tipId ? { ...tip, boosts: tip.boosts + 1 } : tip
    );

    const updatedVillage = {
      ...villageData,
      communityTips: updatedTips
    };

    const newUserStats = {
      ...userStats,
      connectionsHelped: userStats.connectionsHelped + 1
    };

    setVillageData(updatedVillage);
    setUserStats(newUserStats);
    await saveVillageData(updatedVillage);
    await saveUserStats(newUserStats);

    setAnimation('boost');
    setTimeout(() => setAnimation(''), 1000);
  };

  // Heart a gratitude post
  const heartGratitude = async (postId) => {
    const updatedPosts = villageData.gratitudePosts.map(post => 
      post.id === postId ? { ...post, hearts: post.hearts + 1 } : post
    );

    const updatedVillage = {
      ...villageData,
      gratitudePosts: updatedPosts
    };

    const newUserStats = {
      ...userStats,
      connectionsHelped: userStats.connectionsHelped + 1
    };

    setVillageData(updatedVillage);
    setUserStats(newUserStats);
    await saveVillageData(updatedVillage);
    await saveUserStats(newUserStats);

    setAnimation('gratitude');
    setTimeout(() => setAnimation(''), 1000);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="text-center py-12 text-slate-500">Loading your village...</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Village hub
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Your village</h1>
        <p className="max-w-2xl text-base text-slate-600">
          Welcome home. Share a check-in, celebrate gratitude posts, and stay connected with your people.
        </p>
      </header>

      {/* Active Event Banner */}
      {villageData.activeEvent && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <villageData.activeEvent.icon size={40} className="text-purple-600" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">{villageData.activeEvent.name}</h2>
              <p className="text-slate-600">{villageData.activeEvent.description}</p>
            </div>
            <PartyPopper size={28} className="text-purple-600" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <button
          onClick={() => setShowCheckIn(true)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Quick check-in</p>
            <Sun size={20} className="text-orange-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-slate-500">
            Log stress, energy, and connectedness in under a minute.
          </p>
          {!canCheckInToday() && (
            <div className="mt-3 text-xs font-medium text-green-600">✓ Checked in today</div>
          )}
        </button>

        <button
          onClick={() => setShowGratitude(true)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Gratitude wall</p>
            <Sparkles size={20} className="text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-slate-500">
            Highlight wins and thank someone publicly.
          </p>
        </button>

        <button
          onClick={() => setShowSupport(true)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Ask for support</p>
            <Heart size={20} className="text-pink-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-sm text-slate-500">
            Post a request and see who can help.
          </p>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Village Buildings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Village Buildings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Home size={20} className="text-slate-600" />
              Village Buildings
            </h2>
            
            <div
              ref={villageMapRef}
              className="relative touch-none overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-300 via-emerald-200 to-emerald-100 p-6"
              onPointerMove={moveBuilding}
              onPointerUp={endBuildingDrag}
              onPointerLeave={endBuildingDrag}
            >
              <div className="absolute inset-0 opacity-45" style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(16,185,129,0.25), transparent 40%), radial-gradient(circle at 70% 20%, rgba(52,211,153,0.25), transparent 45%), radial-gradient(circle at 60% 70%, rgba(74,222,128,0.25), transparent 45%)'
              }} />
              <div className="absolute left-8 top-8 h-4 w-4 rounded-full bg-emerald-300/70 shadow-sm" />
              <div className="absolute right-16 top-12 h-5 w-5 rounded-full bg-emerald-200/70 shadow-sm" />
              <div className="absolute left-20 bottom-10 h-6 w-6 rounded-full bg-emerald-200/70 shadow-sm" />
              <div className="absolute right-10 bottom-16 h-4 w-4 rounded-full bg-emerald-300/70 shadow-sm" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/60 bg-emerald-200/40" />

              <div className="relative h-[420px]">
                {villageData.buildings.map((building, index) => {
                  const fallback = BUILDINGS.find((item) => item.id === building.id);
                  const spot = building.spot || fallback?.spot || { left: `${20 + index * 18}%`, top: `${22 + index * 16}%` };
                  const image = building.image || fallback?.image;
                  const isMaxLevel = building.level >= building.maxLevel;
                  const animationDelay = `${index * 0.25}s`;
                  const isDragging = draggingId === building.id;

                  return (
                    <div
                      key={building.id}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 ${isDragging ? 'z-20' : ''}`}
                      style={{
                        left: spot.left,
                        top: spot.top,
                        animationName: 'float',
                        animationDuration: `${3.2 + index * 0.4}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay,
                        animationPlayState: isDragging ? 'paused' : 'running'
                      }}
                      onPointerDown={(event) => startBuildingDrag(event, building, spot)}
                    >
                      <div className={`flex w-40 flex-col items-center gap-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
                        {image ? (
                          <img
                            src={image}
                            alt={building.name}
                            className={`h-32 w-32 drop-shadow ${isMaxLevel ? 'animate-pulse' : ''}`}
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="h-32 w-32 rounded-lg bg-emerald-200" />
                        )}
                        <span className="-mt-1 text-sm font-semibold text-slate-900">{building.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Gratitude Wall */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-slate-600" />
                  Gratitude Wall
                </h2>
                <button
                  onClick={() => setShowGratitude(true)}
                  className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Post
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {villageData.gratitudePosts.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Sparkles size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No gratitude posts yet. Be the first!</p>
                  </div>
                ) : (
                  villageData.gratitudePosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-slate-900 mb-2">{post.text}</p>
                          <p className="text-xs text-slate-500">
                            {post.author} • {new Date(post.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => heartGratitude(post.id)}
                          className="px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm"
                        >
                          <Heart size={14} className="text-pink-500" fill={post.hearts > 0 ? "currentColor" : "none"} />
                          <span className="text-slate-600 font-medium">{post.hearts}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Support Requests */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Users size={20} className="text-slate-600" />
                  Support Requests
                </h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {villageData.supportRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No support requests yet.</p>
                  </div>
                ) : (
                  villageData.supportRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-slate-900 mb-2">{request.text}</p>
                      <p className="text-xs text-slate-500">
                        {request.author} • {new Date(request.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Tips */}
          <div className="space-y-6">
            {/* Village Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-600" />
                Village Stats
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">Total Check-Ins</span>
                  <span className="font-semibold text-slate-900">{villageData.totalCheckIns}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">Active Villagers</span>
                  <span className="font-semibold text-slate-900">{villageData.villagers.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">Gratitude Posts</span>
                  <span className="font-semibold text-slate-900">{villageData.gratitudePosts.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600">Your Streak</span>
                  <span className="font-semibold text-orange-600">🔥 {userStats.checkInStreak} days</span>
                </div>
              </div>
            </div>

            {/* Community Tips */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MessageCircle size={18} className="text-slate-600" />
                  Coping Tips
                </h2>
                <button
                  onClick={() => setShowTipShare(true)}
                  className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Share
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {villageData.communityTips.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tips yet. Share wisdom!</p>
                  </div>
                ) : (
                  villageData.communityTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-slate-900 mb-1">{tip.tip}</p>
                          <p className="text-xs text-slate-500">
                            {tip.author}
                          </p>
                        </div>
                        <button
                          onClick={() => boostTip(tip.id)}
                          className="px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
                        >
                          <Zap size={12} className="text-yellow-600" />
                          <span className="text-xs font-medium text-slate-600">{tip.boosts}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Mood Check-In Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">How are you feeling today?</h2>
            <p className="text-slate-600 mb-6">Your check-in helps the village grow! 🌱</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedMood?.id === mood.id
                      ? 'border-slate-900 bg-slate-50 shadow-lg scale-105'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-slate-700">{mood.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckIn(false);
                  setSelectedMood(null);
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedMood && handleMoodCheckIn(selectedMood)}
                disabled={!selectedMood}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedMood
                    ? 'bg-slate-900 text-white hover:bg-slate-700 transform hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Tip Modal */}
      {showTipShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Share a Coping Tip</h2>
            <p className="text-slate-600 mb-6">Help others with your wisdom! 💜</p>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-3">Quick Tips:</h3>
              <div className="grid grid-cols-1 gap-2">
                {COPING_TIPS.slice(0, 5).map((tip, index) => (
                  <button
                    key={index}
                    onClick={() => shareCopingTip(tip)}
                    className="text-left p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 text-sm text-slate-700"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-3">Or write your own:</h3>
              <textarea
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="Share what helps you cope..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTipShare(false);
                  setCustomTip('');
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => customTip.trim() && shareCopingTip()}
                disabled={!customTip.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  customTip.trim()
                    ? 'bg-slate-900 text-white hover:bg-slate-700 transform hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Share Tip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gratitude Post Modal */}
      {showGratitude && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Share Your Gratitude</h2>
            <p className="text-slate-600 mb-6">Celebrate a win or thank someone publicly ✨</p>

            <div className="mb-6">
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder="What are you grateful for today?"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[120px]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGratitude(false);
                  setGratitudeText('');
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={postGratitude}
                disabled={!gratitudeText.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  gratitudeText.trim()
                    ? 'bg-slate-900 text-white hover:bg-slate-700 transform hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Post Gratitude
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Request Modal */}
      {showSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Ask for Support</h2>
            <p className="text-slate-600 mb-6">Share what you need and see who can help 🤝</p>

            <div className="mb-6">
              <textarea
                value={supportText}
                onChange={(e) => setSupportText(e.target.value)}
                placeholder="What kind of support would help you right now?"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-[120px]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSupport(false);
                  setSupportText('');
                }}
                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={postSupportRequest}
                disabled={!supportText.trim()}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                  supportText.trim()
                    ? 'bg-slate-900 text-white hover:bg-slate-700 transform hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Post Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Overlay */}
      {animation && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          {animation === 'sparkle' && (
            <div className="animate-ping">
              <Sparkles size={80} className="text-yellow-400" />
            </div>
          )}
          {animation === 'boost' && (
            <div className="animate-bounce">
              <Zap size={80} className="text-yellow-400" />
            </div>
          )}
          {animation === 'building-grow' && (
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Home size={100} className="text-purple-400 opacity-50" />
              </div>
              <div className="animate-bounce">
                <Home size={80} className="text-purple-600" />
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-6xl animate-spin">✨</span>
              </div>
            </div>
          )}
          {(animation === 'joy' || animation === 'energy' || animation === 'hope') && (
            <div className="animate-spin">
              <Star size={80} className="text-yellow-400" />
            </div>
          )}
          {(animation === 'peace' || animation === 'gratitude') && (
            <div className="animate-pulse">
              <Heart size={80} className="text-pink-400" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
