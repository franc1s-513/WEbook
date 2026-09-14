import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Car, Wrench, Calendar, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, Clock, Plus, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const BookService = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step (1: Vehicle, 2: Services, 3: Slot, 4: Confirm)
  const [currentStep, setCurrentStep] = useState(1);

  // Data states
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [slotsData, setSlotsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected state
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vRes, sRes, bRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/services?activeOnly=true'),
          api.get('/admin/branches')
        ]);

        const vList = vRes.data.data || [];
        setVehicles(vList);

        // Pre-select vehicle if passed in query param
        const preselect = searchParams.get('vehicleId');
        if (preselect && vList.some((v) => v._id === preselect)) {
          setSelectedVehicleId(preselect);
        } else if (vList.length > 0) {
          setSelectedVehicleId(vList[0]._id);
        }

        setServices(sRes.data.data || []);
        const branchList = bRes.data.data || [];
        setBranches(branchList);
        if (branchList.length > 0) {
          setSelectedBranchId(branchList[0]._id);
        }
      } catch (err) {
        showToast('Error loading booking prerequisites', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [searchParams]);

  // Fetch slot availability whenever date or branch changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const url = `/bookings/slots?date=${selectedDate}${selectedBranchId ? `&branchId=${selectedBranchId}` : ''}`;
        const res = await api.get(url);
        setSlotsData(res.data.data.slots || []);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedBranchId]);

  // Service toggle helper
  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Calculations
  const chosenServices = services.filter((s) => selectedServiceIds.includes(s._id));
  const totalAmount = chosenServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = chosenServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const chosenVehicle = vehicles.find((v) => v._id === selectedVehicleId);
  const chosenBranch = branches.find((b) => b._id === selectedBranchId);

  // Step Validation & Handlers
  const canProceedStep1 = !!selectedVehicleId;
  const canProceedStep2 = selectedServiceIds.length > 0;
  const canProceedStep3 = !!selectedDate && !!selectedSlot;

  const handleBookingSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        vehicleId: selectedVehicleId,
        serviceIds: selectedServiceIds,
        branchId: selectedBranchId,
        date: selectedDate,
        timeSlot: selectedSlot,
        paymentMethod,
        notes: customerNotes
      };

      const res = await api.post('/bookings', payload);
      showToast('Appointment successfully scheduled!', 'success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      navigate(`/my-bookings`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Categories list
  const categories = ['ALL', ...new Set(services.map((s) => s.category))];
  const filteredServices = selectedCategory === 'ALL'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Preparing appointment scheduler...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Stepper Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        position: 'relative'
      }}>
        {[
          { step: 1, title: 'Vehicle', icon: Car },
          { step: 2, title: 'Services', icon: Wrench },
          { step: 3, title: 'Date & Slot', icon: Calendar },
          { step: 4, title: 'Confirm & Pay', icon: ShieldCheck }
        ].map((item) => {
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;
          const Icon = item.icon;

          return (
            <div
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: isCurrent || isDone ? 1 : 0.45,
                transition: 'opacity 0.2s'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isCurrent ? 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' :
                            isDone ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.08)',
                color: isCurrent || isDone ? '#030712' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                boxShadow: isCurrent ? '0 0 15px var(--primary-glow)' : 'none'
              }}>
                <Icon size={18} />
              </div>
              <div style={{ display: 'none', md: 'block' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Step 0{item.step}</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Select Vehicle */}
      {currentStep === 1 && (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 1: Choose Your Vehicle</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Select the car from your garage that requires maintenance
          </p>

          {vehicles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                You do not have any vehicles registered yet.
              </p>
              <Link to="/vehicles" className="btn btn-primary">
                <Plus size={16} /> Add Vehicle First
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {vehicles.map((v) => {
                const isSelected = selectedVehicleId === v._id;
                return (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVehicleId(v._id)}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 15px var(--primary-glow)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v.year} {v.make} {v.model}</span>
                      {isSelected && <CheckCircle2 size={20} color="var(--primary)" />}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Reg: {v.regNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Fuel: {v.fuelType}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className="btn btn-primary"
            >
              Continue to Services <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Services */}
      {currentStep === 2 && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>Step 2: Choose Service Packages</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You can select multiple items to bundle into a single service visit
              </p>
            </div>

            {/* Running Total Indicator */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid var(--primary)',
              padding: '0.6rem 1.2rem',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected ({selectedServiceIds.length})</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>${totalAmount}</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  background: selectedCategory === cat ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === cat ? '#030712' : 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {filteredServices.map((svc) => {
              const isSelected = selectedServiceIds.includes(svc._id);
              return (
                <div
                  key={svc._id}
                  onClick={() => toggleService(svc._id)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>{svc.category}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>${svc.price}</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{svc.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1 }}>
                    {svc.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} /> {svc.durationMinutes} mins
                    </div>
                    <span style={{ fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                      {isSelected ? '✓ Selected' : '+ Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(1)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedStep2}
              className="btn btn-primary"
            >
              Continue to Date & Time <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Branch, Date & Slot */}
      {currentStep === 3 && (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>Step 3: Branch, Date & Time Slot</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Choose your preferred location and real-time guaranteed slot
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Branch Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Service Center Location
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Select Appointment Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot('');
                }}
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              Available Time Slots for {selectedDate}
            </label>

            {loadingSlots ? (
              <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>Checking slot capacity...</div>
            ) : slotsData.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No slots available for this date. Please pick another day.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {slotsData.map((slot) => {
                  const isSelected = selectedSlot === slot.timeSlot;
                  const isAvailable = slot.isAvailable;

                  return (
                    <button
                      type="button"
                      key={slot.timeSlot}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.timeSlot)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' :
                                    isAvailable ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-glass)',
                        opacity: isAvailable ? 1 : 0.4,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {slot.timeSlot}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                        {isAvailable ? `${slot.availableSeats} of ${slot.capacity} bays open` : 'Slot Fully Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(2)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!canProceedStep3}
              className="btn btn-primary"
            >
              Review & Payment <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm & Pay */}
      {currentStep === 4 && (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>Step 4: Review & Payment Confirmation</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Please review the appointment details before confirming
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Summary Details */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--primary)' }}>Appointment Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                <div><strong>Vehicle:</strong> {chosenVehicle?.year} {chosenVehicle?.make} {chosenVehicle?.model} ({chosenVehicle?.regNumber})</div>
                <div><strong>Center:</strong> {chosenBranch?.name}</div>
                <div><strong>Address:</strong> {chosenBranch?.address}</div>
                <div><strong>Date:</strong> {selectedDate}</div>
                <div><strong>Time Slot:</strong> {selectedSlot}</div>
                <div><strong>Est. Duration:</strong> ~{totalDuration} minutes</div>
              </div>
            </div>

            {/* Selected Services & Price */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--primary)' }}>Pricing Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {chosenServices.map((svc) => (
                  <div key={svc._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{svc.name}</span>
                    <span style={{ fontWeight: 600 }}>${svc.price}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                <span>Total Amount:</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              Special Instructions / Symptoms for Technician (Optional)
            </label>
            <textarea
              rows={2}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Squeaking noise when turning left, check tire pressure..."
            />
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.6rem', fontWeight: 600 }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                onClick={() => setPaymentMethod('online')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: paymentMethod === 'online' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: paymentMethod === 'online' ? '2px solid var(--primary)' : '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: paymentMethod === 'online' ? 'var(--primary)' : 'inherit' }}>
                  <CreditCard size={18} /> Pay Online Now (Card / UPI)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Simulated instant receipt & payment confirmation
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cash')}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: paymentMethod === 'cash' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: paymentMethod === 'cash' ? '2px solid var(--primary)' : '1px solid var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: paymentMethod === 'cash' ? 'var(--primary)' : 'inherit' }}>
                  <CheckCircle2 size={18} /> Pay at Service Center
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Settle bill upon job inspection and completion
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentStep(3)} className="btn btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleBookingSubmit}
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.8rem' }}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm & Reserve Slot'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookService;
