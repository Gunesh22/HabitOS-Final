import React, { useState, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// License Activation
import LicenseActivation from './LicenseActivation';
import Onboarding from './Onboarding';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import {
  hasValidLicense,
  verifySavedLicense,
  getUserProfile,
  getTrialStatus
} from './licenseManager';

// DnD Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Utilities for 2026 Calendar
const START_DATE = new Date('2026-01-01T00:00:00');
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

const getDayIndex = (date = new Date()) => {
  const diff = date - START_DATE;
  return Math.floor(diff / MILLIS_PER_DAY);
};

const getTodayIndex = () => {
  return getDayIndex(new Date());
};

const generateHistory = () => {
  const todayIndex = getTodayIndex();
  return Array.from({ length: 365 }, (_, i) => {
    if (i > todayIndex) return false;
    return Math.random() > 0.4;
  });
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// --- SORTABLE COMPONENT ---
const SortableItem = ({ id, children, className, style }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const customStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative', // Ensure handle positioning logic words
    ...style
  };

  return (
    <div ref={setNodeRef} style={customStyle} className={className}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '15px',
          cursor: 'grab',
          zIndex: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: 0.3
        }}
        title="Drag to Move"
      >
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#fff' }}></div>
      </div>
      {children}
    </div>
  );
};

const App = () => {
  // --- APP STATE & LICENSE ---
  const [appState, setAppState] = useState('checking'); // 'checking' | 'app' | 'onboarding' | 'expired' | 'license_entry'
  const [trialInfo, setTrialInfo] = useState(null);

  // Check status on mount
  useEffect(() => {
    const checkStatus = async () => {
      // 1. Check for valid full license
      const hasLicense = await hasValidLicense(false);

      if (hasLicense) {
        setAppState('app');
        // Background verify
        verifySavedLicense(false).then(result => {
          if (!result.valid) {
            checkStatus(); // Re-evaluate if online check fails
          }
        });
        return;
      }

      // 2. No License -> Check User Profile
      const profile = getUserProfile();
      if (!profile) {
        setAppState('onboarding');
        return;
      }

      // 3. Has Profile -> Check Trial
      const trial = getTrialStatus();
      setTrialInfo(trial);

      if (trial.isValid) {
        setAppState('app');
      } else {
        setAppState('expired'); // Trial expired - force license screen
      }
    };

    checkStatus();
  }, []);

  const handleOnboardingComplete = () => {
    const trial = getTrialStatus();
    setTrialInfo(trial);
    setAppState('app');
  };

  const handleLicenseVerified = (purchaseData) => {
    setAppState('app');
    setTrialInfo(null); // Clear trial info as they are now fully licensed
  };

  const openLicenseScreen = () => {
    setAppState('license_entry');
  };

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState('habits'); // 'habits' or 'notes'

  // --- HABITS STATE ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits-os-db');
    if (saved) return JSON.parse(saved);
    return []; // Start clean for new users
  });

  // --- NOTES STATE ---
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes-os-db');
    if (saved) return JSON.parse(saved);
    return []; // Start clean for new users
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null); // New state for habit delete confirmation
  const [noteToDelete, setNoteToDelete] = useState(null);   // New state for note delete confirmation
  const [fullScreenNoteId, setFullScreenNoteId] = useState(null); // New state for full screen note
  const [viewMode, setViewMode] = useState('month');

  // Navigation State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  // 2026 starts on Thursday (index 0). First Monday is Index 4. 
  // We offset by 3 days so Week 0 covers Jan 1-4, Week 1 starts Index 4.
  const [selectedWeek, setSelectedWeek] = useState(Math.floor((getTodayIndex() + 3) / 7));

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('habits-os-db', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('notes-os-db', JSON.stringify(notes));
  }, [notes]);

  // --- DND HANDLER ---
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      if (activeTab === 'habits') {
        setHabits((items) => {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        setNotes((items) => {
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  // --- NOTES ACTIONS ---
  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: '',
      content: '',
      wrap: true // Default to text wrapping enabled
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id, field, value) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const deleteNote = (id) => {
    setNoteToDelete(id);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      setNotes(notes.filter(n => n.id !== noteToDelete));
      setNoteToDelete(null);
    }
  };

  // --- HABIT ACTIONS ---
  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      streak: 0,
      history: new Array(365).fill(false)
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const deleteHabit = (e, id) => {
    e.stopPropagation();
    setHabitToDelete(id); // Trigger custom modal instead of window.confirm
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      setHabits(habits.filter(h => h.id !== habitToDelete));
      if (selectedHabit?.id === habitToDelete) setSelectedHabit(null);
      setHabitToDelete(null);
    }
  };

  const toggleHistory = (habitId, dayIndex) => {
    if (dayIndex < 0 || dayIndex >= 365) return;

    const updatedHabits = habits.map(h => {
      if (h && h.id === habitId) { // Check if h exists to be safe
        const newHistory = [...h.history];
        newHistory[dayIndex] = !newHistory[dayIndex];

        const todayIdx = getTodayIndex();
        let tempStreak = 0;
        for (let i = todayIdx; i >= 0; i--) {
          if (newHistory[i]) tempStreak++;
          else break;
        }

        return { ...h, history: newHistory, streak: tempStreak };
      }
      return h;
    });

    setHabits(updatedHabits);
    if (selectedHabit && selectedHabit.id === habitId) {
      setSelectedHabit(updatedHabits.find(h => h.id === habitId));
    }
  };

  const incrementStreak = (e, id) => {
    e.stopPropagation();
    toggleHistory(id, getTodayIndex());
  };

  // --- VIEW LOGIC ---
  const getVisibleRange = (mode) => {
    if (mode === 'week') {
      // 2026 Jan 1 is Thursday. Offset -3 gives us Monday Dec 29 2025 as base of Week 0.
      const mondayIndex = (selectedWeek * 7) - 3;
      const start = Math.max(0, mondayIndex);
      const end = Math.min(365, mondayIndex + 7);
      return { start, end };
    }
    if (mode === 'month') {
      const year = 2026;
      const startObj = new Date(year, selectedMonth, 1);
      const start = getDayIndex(startObj);
      const endObj = new Date(year, selectedMonth + 1, 1);
      const end = getDayIndex(endObj);
      return { start, end };
    }
    if (mode === 'year') {
      return { start: 0, end: 365 };
    }
    return { start: 0, end: 365 };
  };

  const getVisibleData = (history, mode) => {
    const { start, end } = getVisibleRange(mode);
    return history.slice(start, end);
  };

  const getDateLabel = (dayIndex) => {
    const date = new Date(START_DATE);
    date.setDate(START_DATE.getDate() + dayIndex);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekRangeLabel = (i) => {
    const mondayIndex = (i * 7) - 3;
    const startIdx = Math.max(0, mondayIndex);
    const endIdx = Math.min(364, mondayIndex + 6); // inclusive for label

    const d1 = new Date(START_DATE);
    d1.setDate(START_DATE.getDate() + startIdx);

    const d2 = new Date(START_DATE);
    d2.setDate(START_DATE.getDate() + endIdx);

    const f = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${f(d1)} - ${f(d2)}`;
  };

  // --- METRICS ---
  const currentMetrics = useMemo(() => {
    if (!selectedHabit) return null;
    const { start, end } = getVisibleRange(viewMode);
    const today = getTodayIndex();

    const effectiveStart = start;
    const effectiveEnd = Math.min(end, today + 1);
    const totalElapsed = Math.max(0, effectiveEnd - effectiveStart);

    const relevantData = selectedHabit.history.slice(effectiveStart, effectiveEnd);
    const completedDays = relevantData.filter(d => d).length;
    const percentage = inputPercentage(completedDays, totalElapsed);
    const totalDaysInView = end - start;

    let maxStreak = 0;
    let current = 0;
    const fullViewData = selectedHabit.history.slice(start, end);
    fullViewData.forEach(d => {
      if (d) current++;
      else {
        if (current > maxStreak) maxStreak = current;
        current = 0;
      }
    });
    if (current > maxStreak) maxStreak = current;

    return {
      total: totalDaysInView,
      completed: completedDays,
      elapsed: totalElapsed,
      percentage,
      maxStreak
    };
  }, [selectedHabit, viewMode, selectedMonth, selectedWeek]);

  function inputPercentage(partialValue, totalValue) {
    if (totalValue === 0) return 0;
    return Math.round((partialValue / totalValue) * 100);
  }

  // Headers
  const getPeriodLabel = () => {
    if (viewMode === 'week') return `WEEK ${selectedWeek + 1}`;
    if (viewMode === 'month') return `${MONTH_NAMES[selectedMonth]} 2026`.toUpperCase();
    if (viewMode === 'year') return 'YEAR 2026';
    return '';
  };

  // --- DATA EXPORT ---
  const exportData = () => {
    const data = { habits, notes };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-OS-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.habits) setHabits(imported.habits);
        if (imported.notes) setNotes(imported.notes);
        alert('System restored successfully.');
      } catch (err) {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* 1. LOADING */}
      {appState === 'checking' && (
        <div className="license-activation-overlay">
          <div className="spinner"></div>
          <p style={{ marginTop: 20 }}>Loading HabitOS...</p>
        </div>
      )}

      {/* 2. ONBOARDING */}
      {appState === 'onboarding' && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onLicenseActivation={openLicenseScreen}
        />
      )}

      {/* 3. LICENSE ENTRY / EXPIRED */}
      {(appState === 'license_entry' || appState === 'expired') && (
        <LicenseActivation
          onLicenseVerified={handleLicenseVerified}
          allowSkip={false}
          isExpiredTrial={appState === 'expired'}
        />
      )}

      {/* 4. MAIN APP */}
      {appState === 'app' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}>

          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: '40px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1
              style={{ letterSpacing: '12px', fontSize: '14px', opacity: 0.4, textTransform: 'uppercase', marginBottom: '20px', cursor: 'pointer' }}
              onClick={() => window.open('https://habitos.com', '_blank')}
              title="Visit HabitOS Website"
            >
              Human_Optimization_Interface // Saved
            </h1>

            {/* Module Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '50px', marginBottom: '30px' }}>
              <button
                onClick={() => setActiveTab('habits')}
                style={{
                  background: activeTab === 'habits' ? '#00ffcc' : 'transparent',
                  color: activeTab === 'habits' ? '#000' : '#fff',
                  border: 'none', padding: '10px 30px', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', transition: 'all 0.3s'
                }}
              >
                PROTOCOLS
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  background: activeTab === 'notes' ? '#00ffcc' : 'transparent',
                  color: activeTab === 'notes' ? '#000' : '#fff',
                  border: 'none', padding: '10px 30px', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', letterSpacing: '1px', transition: 'all 0.3s'
                }}
              >
                IDEATIONS
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={exportData} className="fancy-button" style={{ fontSize: '10px', padding: '8px 16px' }}>
                EXPORT SYSTEM
              </button>
              <label className="fancy-button" style={{ fontSize: '10px', padding: '8px 16px', display: 'inline-block' }}>
                IMPORT SYSTEM
                <input type="file" onChange={importData} style={{ display: 'none' }} accept=".json" />
              </label>
            </div>

            {activeTab === 'habits' && (
              <form onSubmit={addHabit} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="fancy-input"
                  placeholder="Initialize New Protocol..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
                <button type="submit" className="fancy-button">
                  Initialize
                </button>
              </form>
            )}

            {activeTab === 'notes' && (
              <button onClick={addNote} className="fancy-button" style={{ width: '300px' }}>
                + CREATE NEW CANVAS
              </button>
            )}
          </header>

          {/* --- CONTENT AREA --- */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

            {/* HABITS VIEW */}
            {activeTab === 'habits' && (
              <SortableContext items={habits.map(h => h.id)} strategy={rectSortingStrategy}>
                <div className="bento-grid">
                  {habits.map((habit) => {
                    const todayIdx = getTodayIndex();
                    const recentHistory = habit.history.slice(Math.max(0, todayIdx - 13), todayIdx + 1);

                    return (
                      <SortableItem
                        key={habit.id}
                        id={habit.id}
                        className="habit-card"
                        style={{
                          cursor: 'default',
                          height: '270px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div onClick={() => { setSelectedHabit(habit); setViewMode('month'); }} style={{ flex: 1, cursor: 'pointer', marginTop: '15px' }}>
                          <div className="glow-point" />
                          <button className="delete-btn" onClick={(e) => deleteHabit(e, habit.id)}>✕</button>

                          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px' }}>STREAK_ACTIVE</span>
                            <button
                              onClick={(e) => incrementStreak(e, habit.id)}
                              style={{
                                background: habit.history[todayIdx] ? '#00ffcc' : 'transparent',
                                border: '1px solid #00ffcc',
                                color: habit.history[todayIdx] ? '#000' : '#00ffcc',
                                borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                              }}
                            >
                              {habit.history[todayIdx] ? '✓' : ''}
                            </button>
                          </header>

                          <div className="streak-badge" style={{ marginBottom: 'auto' }}>{habit.streak}</div>
                          <h3 style={{ margin: '0 0 10px 0', fontWeight: '400', color: '#fff', fontSize: '1.2rem' }}>{habit.name}</h3>

                          <div style={{ height: '40px', width: '100%', opacity: 0.5 }}>
                            <SmoothSparkline
                              data={recentHistory}
                              id={habit.id}
                              strokeWidth={0.5}
                              startIndex={Math.max(0, todayIdx - 14)}
                              totalDays={14}
                            />
                          </div>
                        </div>
                      </SortableItem>
                    )
                  })}
                </div>
              </SortableContext>
            )}

            {/* NOTES VIEW */}
            {activeTab === 'notes' && (
              <SortableContext items={notes.map(n => n.id)} strategy={rectSortingStrategy}>
                <div className="notes-grid">
                  {notes.map(note => (
                    <SortableItem
                      key={note.id}
                      id={note.id}
                      className="note-card"
                      style={{}}
                    >
                      <div style={{ marginTop: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}> {/* Push content down below handle */}
                        <div className="note-header">
                          <input
                            type="text"
                            className="note-title-input"
                            placeholder="Untitled Canvas"
                            value={note.title}
                            spellCheck={false}
                            onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className={`note-icon-btn ${!note.wrap ? 'active' : ''}`}
                              onClick={() => updateNote(note.id, 'wrap', !note.wrap)}
                              title={note.wrap ? "Disable Wrapping" : "Enable Wrapping"}
                            >
                              {note.wrap ? '≡' : '→'}
                            </button>
                            <button
                              className="note-icon-btn"
                              onClick={() => setFullScreenNoteId(note.id)}
                              title="Full Screen"
                            >
                              ⤢
                            </button>
                            <button className="note-icon-btn delete-hover" onClick={() => deleteNote(note.id)}>✕</button>
                          </div>
                        </div>
                        <div className={`note-editor ${!note.wrap ? 'nowrap-mode' : ''}`}>
                          <ReactQuill
                            theme="snow"
                            value={note.content}
                            onChange={(content) => updateNote(note.id, 'content', content)}
                            placeholder="Start ideating..."
                            modules={{
                              toolbar: [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['clean']
                              ],
                            }}
                            preserveWhitespace
                          />
                        </div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            )}
          </DndContext>

          {/* Habit Details Modal */}
          {selectedHabit && currentMetrics && (
            <div className="modal-overlay" onClick={() => setSelectedHabit(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={() => setSelectedHabit(null)}>✕</button>

                <header style={{ marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '2.5rem', margin: '0', background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {selectedHabit.name}
                  </h2>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <p style={{ color: '#00ffcc', letterSpacing: '2px', fontSize: '12px', textTransform: 'uppercase', margin: 0, marginRight: '10px' }}>
                        {getPeriodLabel()}
                      </p>

                      {viewMode === 'month' && (
                        <select
                          className="fancy-select"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                          {MONTH_NAMES.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                          ))}
                        </select>
                      )}

                      {viewMode === 'week' && (
                        <select
                          className="fancy-select"
                          value={selectedWeek}
                          onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                        >
                          {Array.from({ length: 53 }, (_, i) => (
                            <option key={i} value={i}>{getWeekRangeLabel(i)}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="time-tabs">
                      {['week', 'month', 'year'].map(mode => (
                        <button
                          key={mode}
                          className={`tab-btn ${viewMode === mode ? 'active' : ''}`}
                          onClick={() => setViewMode(mode)}
                        >
                          {mode.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </header>

                <div className="stats-row">
                  <div className="stat-item">
                    <span className="stat-label">CONSISTENCY ({currentMetrics.elapsed} ELAPSED DAYS)</span>
                    <span className="stat-value">{currentMetrics.percentage}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">COMPLETED DAYS</span>
                    <span className="stat-value">{currentMetrics.completed} / {currentMetrics.total}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">BEST STREAK (PERIOD)</span>
                    <span className="stat-value">{currentMetrics.maxStreak} DAYS</span>
                  </div>
                </div>

                <div style={{ height: '250px', width: '100%', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {(() => {
                    const { start, end } = getVisibleRange(viewMode);
                    const today = getTodayIndex();
                    // Limit the graph to today
                    const effectiveEnd = Math.min(end, today + 1);
                    const graphData = selectedHabit.history.slice(start, effectiveEnd);
                    const totalDays = end - start;

                    return (
                      <SmoothSparkline
                        data={graphData}
                        id={`expanded-${selectedHabit.id}`}
                        strokeWidth={0.4}
                        startIndex={start}
                        totalDays={totalDays}
                        interactive={true}
                      />
                    );
                  })()}
                </div>

                <h3 style={{ fontSize: '14px', opacity: 0.6, letterSpacing: '2px', marginTop: '40px' }}>HISTORY LOG</h3>
                <div className="history-grid" style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${viewMode === 'year' ? '12px' : '30px'}, 1fr))`,
                  gap: viewMode === 'year' ? '4px' : '8px'
                }}>
                  {getVisibleData(selectedHabit.history, viewMode).map((completed, i) => {
                    const { start } = getVisibleRange(viewMode);
                    const absoluteIndex = start + i;
                    const isFuture = absoluteIndex > getTodayIndex();

                    return (
                      <div
                        key={absoluteIndex}
                        className={`history-day ${completed ? 'completed' : ''}`}
                        style={{ opacity: isFuture ? 0.2 : 1, cursor: isFuture ? 'default' : 'pointer' }}
                        onClick={() => !isFuture && toggleHistory(selectedHabit.id, absoluteIndex)}
                        title={`${getDateLabel(absoluteIndex)}${isFuture ? ' (Future)' : ''}: ${completed ? 'Completed' : 'Missed'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Note Modal */}
          {fullScreenNoteId && (
            <div className="modal-overlay" onClick={() => setFullScreenNoteId(null)}>
              <div
                className="modal-content full-screen-note"
                onClick={e => e.stopPropagation()}
                style={{ width: '90%', height: '90vh', maxWidth: 'none', display: 'flex', flexDirection: 'column', padding: '0' }}
              >
                {(() => {
                  const note = notes.find(n => n.id === fullScreenNoteId);
                  if (!note) return null;
                  return (
                    <>
                      <div className="note-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <input
                          type="text"
                          className="note-title-input"
                          style={{ fontSize: '24px' }}
                          placeholder="Untitled Canvas"
                          value={note.title}
                          spellCheck={false}
                          onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                        />
                        <button
                          className={`note-icon-btn ${!note.wrap ? 'active' : ''}`}
                          style={{ fontSize: '20px', marginLeft: '10px' }}
                          onClick={() => updateNote(note.id, 'wrap', !note.wrap)}
                          title={note.wrap ? "Disable Wrapping" : "Enable Wrapping"}
                        >
                          {note.wrap ? '≡' : '→'}
                        </button>
                        <button className="close-button" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: '20px' }} onClick={() => setFullScreenNoteId(null)}>✕</button>
                      </div>
                      <div className={`note-editor ${!note.wrap ? 'nowrap-mode' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <ReactQuill
                          theme="snow"
                          value={note.content}
                          onChange={(content) => updateNote(note.id, 'content', content)}
                          placeholder="Start ideating..."
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                              ['clean']
                            ],
                            keyboard: {
                              bindings: {
                                // Default bindings are usually sufficient
                              }
                            }
                          }}
                          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal (Habits) */}
          {habitToDelete && (
            <div className="modal-overlay" onClick={() => setHabitToDelete(null)}>
              <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '20px', color: '#fff' }}>Delete Protocol?</h3>
                <p style={{ marginBottom: '30px', opacity: 0.7, color: '#fff' }}>
                  Are you sure you want to delete this habit? <br />This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setHabitToDelete(null)}
                    className="fancy-button"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteHabit}
                    className="fancy-button"
                    style={{ borderColor: '#ff4444', color: '#ff4444', background: 'rgba(255,68,68,0.1)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal (Notes) */}
          {noteToDelete && (
            <div className="modal-overlay" onClick={() => setNoteToDelete(null)}>
              <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '20px', color: '#fff' }}>Delete Canvas?</h3>
                <p style={{ marginBottom: '30px', opacity: 0.7, color: '#fff' }}>
                  Are you sure you want to delete this note? <br />This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setNoteToDelete(null)}
                    className="fancy-button"
                    style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', background: 'transparent' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteNote}
                    className="fancy-button"
                    style={{ borderColor: '#ff4444', color: '#ff4444', background: 'rgba(255,68,68,0.1)' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Reusable Sparkline
const SmoothSparkline = ({ data, id, strokeWidth = 1, startIndex = 0, totalDays = 30, interactive = false }) => {
  // 1. Calculate Trend Scores
  const points = useMemo(() => {
    let score = 50;
    let lastWasMiss = false;
    return data.map((completed) => {
      if (completed) {
        score += 5;
        lastWasMiss = false;
      } else {
        if (lastWasMiss) {
          score -= 5;
        } else {
          lastWasMiss = true;
        }
      }
      return score;
    });
  }, [data]);

  const width = 100;
  const height = 30;

  // 2. Normalize Y values
  const min = Math.min(...points, 30);
  const max = Math.max(...points, 70);
  const range = max - min || 1;
  const normalizedPoints = useMemo(() => points.map(p => height - ((p - min) / range * height)), [points, min, range]);

  // 3. Prepare Coordinates
  const coords = useMemo(() => normalizedPoints.map((y, i) => {
    const x = totalDays <= 1 ? 0 : (i / (totalDays - 1)) * width;
    return [x, y];
  }), [normalizedPoints, totalDays]);

  // 4. Generate Path & Bezier Segments
  const { stroke, fill, segments } = useMemo(() => {
    if (coords.length < 1) return { stroke: "", fill: "", segments: [] };
    if (coords.length === 1) {
      return {
        stroke: `M ${coords[0][0] - 1} ${coords[0][1]} L ${coords[0][0] + 1} ${coords[0][1]}`,
        fill: "",
        segments: []
      };
    }

    const getControlPoint = (current, previous, next, reverse) => {
      const p = previous || current;
      const n = next || current;
      const smoothing = 0.2;
      const o = { x: n[0] - p[0], y: n[1] - p[1] };
      const x = current[0] + o.x * smoothing * (reverse ? -1 : 1);
      const y = current[1] + o.y * smoothing * (reverse ? -1 : 1);
      return [x, y];
    };

    let d = `M ${coords[0][0]} ${coords[0][1]}`;
    const segs = [];

    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[i - 1];
      const p3 = coords[i];
      const cp1 = getControlPoint(p0, coords[i - 2], p3, false);
      const cp2 = getControlPoint(p3, p0, coords[i + 1], true);

      d += ` C ${cp1[0]} ${cp1[1]}, ${cp2[0]} ${cp2[1]}, ${p3[0]} ${p3[1]}`;
      segs.push({ p0, cp1, cp2, p3 });
    }

    const lastX = coords[coords.length - 1][0];
    const firstX = coords[0][0];
    const fillD = d + ` L ${lastX} ${height} L ${firstX} ${height} Z`;

    return { stroke: d, fill: fillD, segments: segs };
  }, [coords]);

  // --- INTERACTION LOGIC ---
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [cursorPos, setCursorPos] = useState(null); // {x, y}
  const containerRef = React.useRef(null);

  const getDateStr = (offset) => {
    const date = new Date('2026-01-01T00:00:00');
    date.setDate(date.getDate() + startIndex + offset);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const cubicBezier = (t, p0, p1, p2, p3) => {
    const oneMinusT = 1 - t;
    return (
      Math.pow(oneMinusT, 3) * p0 +
      3 * Math.pow(oneMinusT, 2) * t * p1 +
      3 * oneMinusT * Math.pow(t, 2) * p2 +
      Math.pow(t, 3) * p3
    );
  };

  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current || coords.length === 0) return;

    const { left, width: rectWidth } = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - left;
    let svgX = (relativeX / rectWidth) * width;

    // Clamp X to the last known data point (Today) to prevent going into future
    const maxGraphX = coords[coords.length - 1][0];
    const clampedX = Math.min(Math.max(0, svgX), maxGraphX);

    // Find segment
    if (coords.length < 2) {
      setCursorPos({ x: coords[0][0], y: coords[0][1] });
      setHoveredIndex(0);
      return;
    }

    const step = coords[1][0] - coords[0][0];
    let i = Math.floor(clampedX / step);
    i = Math.max(0, Math.min(i, coords.length - 2));

    // Calculate T (0 to 1) in this segment
    const segmentStartX = coords[i][0];
    const segmentEndX = coords[i + 1][0];
    const t = (clampedX - segmentStartX) / (segmentEndX - segmentStartX);
    const clampedT = Math.max(0, Math.min(1, t));

    // Get segment bezier points
    if (segments[i]) {
      const { p0, cp1, cp2, p3 } = segments[i];
      const smoothY = cubicBezier(clampedT, p0[1], cp1[1], cp2[1], p3[1]);
      setCursorPos({ x: clampedX, y: smoothY });
    }

    // Snapping for Tooltip Data (Time)
    let nearestIdx = Math.round(clampedX / step);
    nearestIdx = Math.max(0, Math.min(nearestIdx, data.length - 1));
    setHoveredIndex(nearestIdx);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredIndex(null);
      setCursorPos(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        cursor: interactive ? 'crosshair' : 'default',
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00ffcc', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#00ffcc', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        <path d={fill} fill={`url(#grad-${id})`} />
        <path d={stroke} fill="none" stroke="#00ffcc" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />

        {/* Highlight Dot (Smooth) */}
        {interactive && cursorPos && (
          <circle
            cx={cursorPos.x}
            cy={cursorPos.y}
            r="1.5"
            fill="#000"
            stroke="#00ffcc"
            strokeWidth="1"
            pointerEvents="none"
          />
        )}
      </svg>

      {/* Custom Tooltip Overlay (Snapped Data) */}
      {interactive && hoveredIndex !== null && cursorPos && (
        <div
          className="graph-tooltip"
          style={{
            left: `${(cursorPos.x / width) * 100}%`, // Follow smoothed X
            top: `0%`,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: '2px' }}>{getDateStr(hoveredIndex)}</div>
          <div style={{ color: data[hoveredIndex] ? '#00ffcc' : '#ff4444' }}>
            {data[hoveredIndex] ? 'COMPLETED' : 'MISSED'}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
