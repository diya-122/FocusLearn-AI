import { useState, useEffect } from 'react';
import { HiOutlineCalendar, HiPlus, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import plannerService from '../../services/plannerService';
import styles from './Calendar.module.css';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'custom', color: '#3B82F6' });

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await plannerService.getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await plannerService.createEvent({
        title: newEvent.title,
        date: newEvent.date,
        event_type: newEvent.type,
        color: newEvent.color
      });
      setShowModal(false);
      setNewEvent({ title: '', date: '', type: 'custom', color: '#3B82F6' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>Track important dates and deadlines.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiPlus /> Add Event
        </button>
      </header>

      <div className={styles.calendarCard}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth} className={styles.navBtn}><HiChevronLeft /></button>
          <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth} className={styles.navBtn}><HiChevronRight /></button>
        </div>

        <div className={styles.grid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={styles.dayName}>{day}</div>
          ))}
          {blanks.map(blank => (
            <div key={`blank-${blank}`} className={styles.dayCellEmpty} />
          ))}
          {days.map(day => {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            
            const today = new Date();
            const isToday = today.getDate() === day && 
                            today.getMonth() === currentDate.getMonth() && 
                            today.getFullYear() === currentDate.getFullYear();
            
            return (
              <div key={day} className={`${styles.dayCell} ${isToday ? styles.today : ''}`}>
                <span className={styles.dayNumber}>{day}</span>
                <div className={styles.eventList}>
                  {dayEvents.map(e => (
                    <div key={e.id} className={styles.eventBadge} style={{ backgroundColor: e.color }}>
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2>Add Event</h2>
            <form onSubmit={handleAddEvent}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Type</label>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className={styles.input}>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="reminder">Reminder</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Color</label>
                <input type="color" value={newEvent.color} onChange={e => setNewEvent({...newEvent, color: e.target.value})} className={styles.colorInput} />
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
