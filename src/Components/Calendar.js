import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import "./Calendar.css";

Modal.setAppElement("#root");

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    color: "#3788d8",
    image: null,
  });

  //load events from localStorage when the component mounts
  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("calendarEvents"));
    if (savedEvents) {
      setEvents(savedEvents);
    }
  }, []);


  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  
  //save events to localStorage
  const saveEventsToLocalStorage = (events) => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  };

  const handleDateClick = (arg) => {
    setIsEditing(false);
    setSelectedEventId(null);
    setFormData({
      title: "",
      startDate: arg.dateStr,
      startTime: "",
      endDate: arg.dateStr,
      endTime: "",
      color: "#3788d8",
      image: null,
    });
    setModalIsOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setIsEditing(true);
    setSelectedEventId(event.id);
    setFormData({
      title: event.title,
      startDate: event.startStr.split("T")[0],
      startTime: event.startStr.split("T")[1] || "",
      endDate: event.endStr ? event.endStr.split("T")[0] : "",
      endTime: event.endStr ? event.endStr.split("T")[1] || "" : "",
      color: event.backgroundColor,
      image: event.extendedProps.image || null,
    });
    setModalIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: URL.createObjectURL(file) });
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const { title, startDate, startTime, endDate, endTime, color, image } = formData;

    if (!title || !startDate || !startTime || !endDate || !endTime) {
      alert("Please fill in all fields");
      return;
    }

    const newEvent = {
      id: isEditing ? selectedEventId : String(Date.now()),
      title,
      start: `${startDate}T${startTime}`,
      end: `${endDate}T${endTime}`,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { image },
    };

    let updatedEvents;
    if (isEditing) {
      updatedEvents = events.map((event) => (event.id === selectedEventId ? newEvent : event));
    } else {
      updatedEvents = [...events, newEvent];
    }

    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    setModalIsOpen(false);
  };

  const handleDeleteEvent = () => {
    const updatedEvents = events.filter((event) => event.id !== selectedEventId);
    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    setModalIsOpen(false);
  };

  return (
    <>
    <div className={`calendar-container ${isDarkMode ? "dark" : "light"}`}>
      <h2>Click on a date to add an event or click an event to edit</h2>

      <button onClick={toggleDarkMode} className="theme-toggle">
          Toggle {isDarkMode ? "Light" : "Dark"} Mode
        </button> 

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        selectable={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={renderEventContent}

        headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          customButtons={{
            today: {
              text: "Today",
              click: () => setTodayDate(new Date()),
            },
          }}
          datesSet={(data) => setTodayDate(new Date())} 
      />
       

       


      {/* Modal Popup */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h3>{isEditing ? "Edit Event" : "Add Event"}</h3>
        <form onSubmit={handleSaveEvent} className="event-form">
          <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleInputChange} required />
          <label>Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
          <label>End Date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
          <label>Pick Event Color</label>
          <input type="color" name="color" value={formData.color} onChange={handleInputChange} />
          <label>Upload Event Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
          <button type="submit">{isEditing ? "Update Event" : "Add Event"}</button>
          {isEditing && <button type="button" className="delete-btn" onClick={handleDeleteEvent}>Delete</button>}
          <button type="button" className="close-btn" onClick={() => setModalIsOpen(false)}>Cancel</button>
        </form>
      </Modal>
    </div>
    <div className="footer">
    <p>&copy; 2025 My Calendar App. Created by kausik saha.</p>
    </div>
    </>
  );
};

// custom event renderer (To show image)
const renderEventContent = (eventInfo) => {
    return (
      <div>
        <strong style={{ color: "white" }}>{eventInfo.event.title}</strong>
        {eventInfo.event.extendedProps.image && (
          <img
            src={eventInfo.event.extendedProps.image}
            alt="event"
            className="event-image"
          />
        )}
      </div>
    );
  };

export default Calendar;
