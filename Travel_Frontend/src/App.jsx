import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Plane, Edit, Save, X, Trash2 } from "lucide-react";
import "./App.css";
import { authAPI, bookingsAPI, usersAPI } from "./api";

const ADMIN_CREDENTIALS = { email: "arunavaarunava123@gmail.com", password: "Arunavamern123@" };

const ongoingEvents = [
  { id: 1, title: "Digha Beach Gateway", date: "Dec 25, 2025", price: "₹3,000", badge: "BEACH", image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Escape to Digha's serene beaches." },
  { id: 2, title: "puri Beach Carnival 2025", date: "Coming Soon", price: "Coming Soon", badge: "CARNIVAL", image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Vibrant beach carnival in Goa." },
  { id: 3, title: "Himalayan Winter Trek", date: "Coming Soon", price: "Coming Soon", badge: "ADVENTURE", image: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Snowy Himalayan adventure." },
  { id: 4, title: "Kerala Backwater Festival", date: "Coming Soon", price: "Coming Soon", badge: "CULTURAL", image: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Cruise Kerala's backwaters." },
];

const BackButton = ({ to = "/", text = "Back to Home" }) => <Link to={to} className="btn back-btn">⬅ {text}</Link>;

const EventCard = ({ event, user }) => {
  const isAvailable = event.price !== "Coming Soon";
  const CardContent = () => (
    <div className={`place-card ${isAvailable ? 'event-card' : 'coming-soon-card'}`}>
      <img src={event.image} alt={event.title} />
      <div style={{ padding: '1.5rem' }}>
        <span className={`event-badge ${isAvailable ? '' : 'coming-soon-badge'}`}>{event.badge}</span>
        <h4>{event.title}</h4>
        <p>📅 {event.date}</p>
        <p>{event.description}</p>
        <p className={isAvailable ? "price-available" : "price-coming"}>{event.price}</p>
        {!isAvailable && <div className="coming-soon-overlay"><span>Coming Soon</span></div>}
        {isAvailable && user && <div className="book-now-overlay"><span>Book Now</span></div>}
        {isAvailable && !user && <div className="login-to-book-overlay"><span>Login to Book</span></div>}
      </div>
    </div>
  );
  return isAvailable ? (
    user ? <Link to={`/book/${event.id}`} className="event-card-link"><CardContent /></Link> :
    <div onClick={() => alert('Please login to book this trip')} style={{ cursor: 'pointer' }}><CardContent /></div>
  ) : <CardContent />;
};

const ServicesPage = () => (
  <div className="services-page">
    <h2>Our Agency</h2>
    <p>DreamTrips offers safe, affordable travel experiences.</p>
    <h3>Rules</h3>
    <ul>
      <li>Valid ID required.</li>
      <li>Advance payment needed.</li>
      <li>Follow safety guidelines.</li>
      <li>No last-minute cancellations.</li>
    </ul>
    <BackButton />
  </div>
);

const BookingPage = ({ user }) => {
  const eventId = window.location.pathname.match(/\/book\/(\d+)/)?.[1];
  const selectedEvent = eventId ? ongoingEvents.find(e => e.id === parseInt(eventId)) : null;
  const [members, setMembers] = useState([{ name: '', age: '', gender: '', foodPreference: 'veg' }]);
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    destination: selectedEvent?.title || '', travelDate: '', pickupLocation: '',
    seatType: 'normal', requirements: '', suggestions: ''
  });

  const updateMember = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  if (!user) return (
    <div className="booking-page">
      <div className="login-required">
        <h2>🔐 Login Required</h2>
        <p>Please login to book</p>
        <Link to="/" className="btn">Go to Login</Link>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validMembers = members.filter(m => m.name && m.age && m.gender);
    if (validMembers.length === 0) {
      alert('Please add at least one member');
      return;
    }

    if (!formData.travelDate) {
      alert('Please select a travel date');
      return;
    }

    try {
      const bookingData = {
        primaryContact: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          destination: formData.destination,
          travelDate: formData.travelDate
        },
        members: validMembers,
        tripDetails: {
          pickupLocation: formData.pickupLocation,
          seatType: formData.seatType,
          requirements: formData.requirements || '',
          suggestions: formData.suggestions || ''
        }
      };

      await bookingsAPI.create(bookingData);
      alert('Booking submitted! Awaiting admin approval.');
      window.location.href = '/bookings';
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
  };

  return (
    <div className="booking-page">
      <h2>Book Your Trip</h2>
      {selectedEvent && (
        <div className="selected-event-info">
          <h3>{selectedEvent.title}</h3>
          <p><strong>Date:</strong> {selectedEvent.date}</p>
          <p><strong>Price:</strong> {selectedEvent.price}/person</p>
        </div>
      )}
      <form className="booking-form" onSubmit={handleSubmit}>
        <h4 className="form-section-title">Primary Contact</h4>
        {['name', 'email', 'phone', 'destination'].map(field => (
          <input key={field} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} 
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={formData[field]} 
            onChange={e => setFormData({ ...formData, [field]: e.target.value })} required />
        ))}
        <input type="date" value={formData.travelDate} onChange={e => setFormData({ ...formData, travelDate: e.target.value })} required />

        <div className="members-section">
          <div className="section-header">
            <h4 className="form-section-title">Members ({members.length})</h4>
            <button type="button" className="add-member-btn" onClick={() => setMembers([...members, { name: '', age: '', gender: '', foodPreference: 'veg' }])}>
              + Add Member
            </button>
          </div>
          {members.map((member, i) => (
            <div key={i} className="member-card">
              <div className="member-header">
                <h5>Member {i + 1}</h5>
                {members.length > 1 && <button type="button" className="remove-member-btn" onClick={() => setMembers(members.filter((_, idx) => idx !== i))}>✕</button>}
              </div>
              <div className="member-fields">
                <input type="text" placeholder="Name" value={member.name} onChange={e => updateMember(i, 'name', e.target.value)} required />
                <input type="number" placeholder="Age" value={member.age} onChange={e => updateMember(i, 'age', e.target.value)} required />
                <select value={member.gender} onChange={e => updateMember(i, 'gender', e.target.value)} required>
                  <option value="">Gender</option>
                  {['male', 'female', 'other'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="food-preference">
                  <label className="food-label">Food Preference:</label>
                  <div className="radio-group">
                    {['veg', 'non-veg'].map(pref => (
                      <label key={pref} className="radio-option">
                        <input type="radio" name={`food-${i}`} value={pref} checked={member.foodPreference === pref} 
                          onChange={e => updateMember(i, 'foodPreference', e.target.value)} />
                        <span className="radio-custom"></span>
                        {pref === 'veg' ? '🥬 Veg' : '🍗 Non-Veg'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h4 className="form-section-title">Trip Details</h4>
        <input type="text" placeholder="Pickup Location" value={formData.pickupLocation} onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })} required />
        <select value={formData.seatType} onChange={e => setFormData({ ...formData, seatType: e.target.value })} required>
          <option value="">Seat Type</option>
          {['bed', 'normal'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <textarea placeholder="Special Requirements" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
        <textarea placeholder="Suggestions" value={formData.suggestions} onChange={e => setFormData({ ...formData, suggestions: e.target.value })} />
        <button type="submit" className="btn">Submit Booking</button>
      </form>
      <BackButton to="/events" text="Back to Packages" />
    </div>
  );
};

const UserBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userBookings = await bookingsAPI.getUserBookings();
        setBookings(userBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) return <div className="user-bookings-page"><h2>Loading...</h2></div>;

  return (
    <div className="user-bookings-page">
      <h2>Your Bookings</h2>
      {bookings.length === 0 ? (
        <div className="no-bookings">You have no bookings yet</div>
      ) : (
        <div className="bookings-container">
          {bookings.map(booking => (
            <div key={booking._id} className="user-booking-card">
              <div className="booking-header">
                <h3>Booking #{booking._id}</h3>
                <p className="booking-date">Booked: {new Date(booking.createdAt).toLocaleDateString()}</p>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status.toUpperCase()}
                </span>
                {booking.status === 'confirmed' && booking.ticketNumber && (
                  <p className="ticket-number">Ticket: {booking.ticketNumber}</p>
                )}
                {booking.status === 'rejected' && (
                  <p className="rejected-message">Your booking has been rejected by admin</p>
                )}
              </div>
              <div className="booking-content">
                <div className="booking-section">
                  <h4>Primary Contact</h4>
                  <div className="booking-info">
                    {Object.entries(booking.primaryContact).map(([key, value]) => (
                      <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value || 'N/A'}</p>
                    ))}
                  </div>
                </div>
                <div className="booking-section">
                  <h4>Members ({booking.members.length})</h4>
                  <div className="members-info">
                    {booking.members.map((member, i) => (
                      <div key={i} className="member-card">
                        <h5>{member.name}</h5>
                        <p>Age: {member.age} | Gender: {member.gender} | Food: {member.foodPreference}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="booking-section">
                  <h4>Trip Details</h4>
                  <div className="booking-info">
                    {Object.entries(booking.tripDetails).map(([key, value]) => (
                      <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value || 'None'}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <BackButton to="/" text="Back to Home" />
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [editing, setEditing] = useState({ type: null, data: null });
  const [data, setData] = useState({ bookings: [], users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, usersData] = await Promise.all([
          bookingsAPI.getAllBookings(),
          usersAPI.getAll()
        ]);
        setData({ bookings: bookingsData, users: usersData });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (bookingId) => {
    try {
      const updatedBooking = await bookingsAPI.update(bookingId, { status: 'confirmed' });
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => 
          b._id === bookingId ? updatedBooking : b
        )
      }));
      alert('Booking approved!');
    } catch (error) {
      alert('Approval failed: ' + error.message);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const updatedBooking = await bookingsAPI.update(bookingId, { status: 'rejected' });
      setData(prev => ({
        ...prev,
        bookings: prev.bookings.map(b => 
          b._id === bookingId ? updatedBooking : b
        )
      }));
      alert('Booking rejected.');
    } catch (error) {
      alert('Rejection failed: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      if (editing.type === 'bookings') {
        await bookingsAPI.update(editing.data._id, editing.data);
      } else {
        await usersAPI.update(editing.data._id, editing.data);
      }
      setData(prev => ({
        ...prev,
        [editing.type]: prev[editing.type].map(item => 
          item._id === editing.data._id ? editing.data : item
        )
      }));
      setEditing({ type: null, data: null });
    } catch (error) {
      alert('Save failed: ' + error.message);
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Delete this ${type.slice(0, -1)}?`)) return;
    try {
      if (type === 'bookings') {
        await bookingsAPI.delete(id);
      } else {
        await usersAPI.delete(id);
      }
      setData(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item._id !== id),
      }));
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const updateField = (field, value, memberIndex = null, memberField = null) => {
    if (memberIndex !== null) {
      const newMembers = [...editing.data.members];
      newMembers[memberIndex][memberField] = value;
      setEditing({ ...editing, data: { ...editing.data, members: newMembers } });
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditing({ ...editing, data: { ...editing.data, [parent]: { ...editing.data[parent], [child]: value } } });
    } else {
      setEditing({ ...editing, data: { ...editing.data, [field]: value } });
    }
  };

  const logout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  if (loading) return <div className="admin-dashboard"><h2>Loading...</h2></div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-welcome">
          <h2>Admin Dashboard</h2>
          <p>Welcome, Admin</p>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Bookings ({data.bookings.length})
          </button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Users ({data.users.length})
          </button>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bookings-container">
          {data.bookings.length === 0 ? <div className="no-data">No bookings</div> : data.bookings.map(booking => {
            const user = data.users.find(u => u._id === booking.userId);
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>Booking #{booking._id}</h3>
                    <p className="booking-date">Booked: {new Date(booking.createdAt).toLocaleDateString()}</p>
                    <p>User: {user?.name || 'Unknown'} ({user?.email || 'N/A'})</p>
                    <span className={`status-badge ${booking.status}`}>{booking.status.toUpperCase()}</span>
                    {booking.ticketNumber && <p className="ticket-number">Ticket: {booking.ticketNumber}</p>}
                  </div>
                  {editing.data?._id === booking._id && editing.type === 'bookings' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}><Save size={16} /> Save</button>
                      <button className="cancel-btn" onClick={() => setEditing({ type: null, data: null })}><X size={16} /> Cancel</button>
                    </div>
                  ) : (
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(booking._id)}>Approve</button>
                          <button className="reject-btn" onClick={() => handleReject(booking._id)}>Reject</button>
                        </>
                      )}
                      <button className="edit-btn" onClick={() => setEditing({ type: 'bookings', data: { ...booking } })}><Edit size={16} /> Edit</button>
                      <button className="delete-btn" onClick={() => deleteItem('bookings', booking._id)}><Trash2 size={16} /> Delete</button>
                    </div>
                  )}
                </div>
                <div className="booking-content">
                  {['primaryContact', 'members', 'tripDetails'].map(section => (
                    <div key={section} className="booking-section">
                      <h4>{section === 'primaryContact' ? 'Primary Contact' : section === 'members' ? `Members (${booking.members.length})` : 'Trip Details'}</h4>
                      {editing.data?._id === booking._id && editing.type === 'bookings' ? (
                        <div className={section === 'members' ? 'members-edit' : 'edit-fields'}>
                          {section === 'members' ? editing.data.members.map((member, i) => (
                            <div key={i} className="member-edit-card">
                              <h5>Member {i + 1}</h5>
                              <div className="member-edit-fields">
                                {['name', 'age', 'gender', 'foodPreference'].map(field => field === 'gender' || field === 'foodPreference' ? (
                                  <select key={field} value={member[field]} onChange={e => updateField(null, e.target.value, i, field)}>
                                    {(field === 'gender' ? ['male', 'female', 'other'] : ['veg', 'non-veg']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                ) : (
                                  <input key={field} value={member[field]} onChange={e => updateField(null, e.target.value, i, field)} placeholder={field} />
                                ))}
                              </div>
                            </div>
                          )) : Object.keys(editing.data[section]).map(key => key === 'seatType' || key === 'status' ? (
                            <select key={key} value={editing.data[section][key]} onChange={e => updateField(`${section}.${key}`, e.target.value)}>
                              {(key === 'seatType' ? ['bed', 'normal'] : ['pending', 'confirmed', 'rejected']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <textarea key={key} value={editing.data[section][key]} onChange={e => updateField(`${section}.${key}`, e.target.value)} placeholder={key} />
                          ))}
                        </div>
                      ) : (
                        <div className={section === 'members' ? 'members-info' : 'booking-info'}>
                          {section === 'members' ? booking.members.map((m, i) => (
                            <div key={i} className="member-card">
                              <h5>{m.name}</h5>
                              <p>Age: {m.age} | Gender: {m.gender} | Food: {m.foodPreference}</p>
                            </div>
                          )) : Object.entries(booking[section]).map(([k, v]) => (
                            <p key={k}><strong>{k}:</strong> {v || 'None'}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-container">
          {data.users.length === 0 ? <div className="no-data">No users</div> : data.users.map(user => {
            const userBookings = data.bookings.filter(b => b.userId === user._id);
            return (
              <div key={user._id} className="user-card">
                <div className="user-header">
                  <div>
                    <h3>{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <p className="user-bookings">Bookings: {userBookings.length}</p>
                    <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  {editing.data?._id === user._id && editing.type === 'users' ? (
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleSave}><Save size={16} /> Save</button>
                      <button className="cancel-btn" onClick={() => setEditing({ type: null, data: null })}><X size={16} /> Cancel</button>
                    </div>
                  ) : (
                    <div className="user-actions">
                      <button className="edit-btn" onClick={() => setEditing({ type: 'users', data: { ...user } })}><Edit size={16} /> Edit</button>
                      <button className="delete-btn" onClick={() => deleteItem('users', user._id)}><Trash2 size={16} /> Delete</button>
                    </div>
                  )}
                </div>
                {editing.data?._id === user._id && editing.type === 'users' ? (
                  <div className="user-edit-fields">
                    <input value={editing.data.name} onChange={e => setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })} placeholder="Name" />
                    <input value={editing.data.email} onChange={e => setEditing({ ...editing, data: { ...editing.data, email: e.target.value } })} placeholder="Email" />
                    <select value={editing.data.isActive} onChange={e => setEditing({ ...editing, data: { ...editing.data, isActive: e.target.value === 'true' } })}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                ) : (
                  <div className="user-details">
                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {userBookings.length > 0 && (
                  <div className="user-bookings-list">
                    <h4>Bookings:</h4>
                    {userBookings.map(b => (
                      <div key={b._id} className="mini-booking">
                        <span>Booking #{b._id} - {b.primaryContact.destination}</span>
                        <span className={`status-badge mini ${b.status}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <BackButton />
    </div>
  );
};

const AuthModal = ({ show, onClose, onLogin, onRegister }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setIsLoading(false);
          return;
        }
        await onRegister(formData);
        alert('Account created successfully! Please login.');
        setIsSignup(false);
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      } else {
        await onLogin(formData);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>{isSignup ? "Create Account" : "Login"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <input 
              type="text" 
              placeholder="Name" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            required 
          />
          {isSignup && (
            <input 
              type="tel" 
              placeholder="Phone" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            />
          )}
          <input 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
            required 
          />
          {isSignup && (
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={formData.confirmPassword} 
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} 
              required 
            />
          )}
          <small className="auth-hint">
            {isSignup ? 'Create account to book trips' : 'Enter credentials to login or sign up'}
          </small>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Processing..." : (isSignup ? "Create Account" : "Login")}
          </button>
        </form>
        <p className="auth-toggle">
          {isSignup ? "Have an account? " : "No account? "}
          <span onClick={() => {
            setIsSignup(!isSignup);
            setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
          }}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, condition, redirect = "/" }) => condition ? children : <Navigate to={redirect} replace />;

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser') || 'null'));

  const handleAuth = async (authData, type) => {
    try {
      console.log('Auth attempt:', type, authData.email);
      
      if (type === 'login') {
        // Check if admin login
        if (authData.email === ADMIN_CREDENTIALS.email && authData.password === ADMIN_CREDENTIALS.password) {
          try {
            const response = await authAPI.adminLogin(authData);
            localStorage.setItem('token', response.token);
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminEmail', authData.email);
            window.location.href = '/admin';
            return;
          } catch (adminError) {
            console.error('Admin login failed:', adminError);
            alert('Admin login failed: ' + adminError.message);
            return;
          }
        }
        
        // Regular user login
        const response = await authAPI.login(authData);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        setShowAuth(false);
        alert('Login successful!');
      } else if (type === 'register') {
        // Registration
        const registrationData = { 
          name: authData.name, 
          email: authData.email, 
          password: authData.password 
        };
        
        if (authData.phone && authData.phone.trim() !== '') {
          registrationData.phone = authData.phone;
        }
        
        await authAPI.register(registrationData);
        alert('Account created successfully! Please login with your credentials.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app">
            <header className="header">
              <h1 className="logo"><Plane className="icon" /> DreamTrips</h1>
              <nav className="nav">
                <a href="#home">Home</a>
                <Link to="/services">Services</Link>
                <Link to="/events">Packages</Link>
                {user ? (
                  <>
                    <Link to="/bookings" className="nav-bookings">Your Bookings</Link>
                    <span className="user-welcome">Welcome, {user.name}</span>
                    <button className="btn" onClick={() => {
                      setUser(null); 
                      localStorage.removeItem('currentUser');
                      localStorage.removeItem('token');
                      localStorage.removeItem('isAdmin');
                      localStorage.removeItem('adminEmail');
                    }}>Logout</button>
                  </>
                ) : <button className="btn" onClick={() => setShowAuth(true)}>Login</button>}
                <a href="#contact">Contact</a>
              </nav>
            </header>
            <section id="home" className="hero">
              <h2>Explore the World</h2>
              <p>Your dream vacation awaits.</p>
              {user ? <Link to="/events" className="btn">Book Now</Link> : 
                <button className="btn" onClick={() => setShowAuth(true)}>Login to Book</button>}
            </section>
            
            <AuthModal 
              show={showAuth} 
              onClose={() => setShowAuth(false)} 
              onLogin={(d) => handleAuth(d, 'login')} 
              onRegister={(d) => handleAuth(d, 'register')} 
            />
          </div>
        } />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/events" element={<div className="services-page">
          <h2>🎉 Choose Your Trip</h2>
          <p>Explore exclusive travel packages.</p>
          {!user && <div className="login-prompt">🔐 Please login to book</div>}
          <div className="places">{ongoingEvents.map(e => <EventCard key={e.id} event={e} user={user} />)}</div>
          <BackButton />
        </div>} />
        <Route path="/book/:eventId" element={<ProtectedRoute condition={user}><BookingPage user={user} /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute condition={user}><UserBookings user={user} /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute condition={localStorage.getItem('isAdmin') === 'true' && localStorage.getItem('adminEmail') === ADMIN_CREDENTIALS.email}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}