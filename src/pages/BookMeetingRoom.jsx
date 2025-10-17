import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Modal,
    TextField,
    Paper,
    Fade,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    IconButton,
    Popover,
    Checkbox,
    FormControlLabel,
    Divider,
    RadioGroup,
    Radio,
    Input
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, addMonths, endOfMonth } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
// import Login from '../pages/Login';
import bookMeetingRoomImg from '../assets/images/damir-kopezhanov-VM1Voswbs0A-unsplash.jpg';
// Add import for logo at the top
import logo from '../assets/images/BoldTribe Logo-3.png'; // Make sure you have the logo in your assets folder
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';
import PendingIcon from '@mui/icons-material/Pending';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/modals/LoginModal';

const BookMeetingRoom = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingType, setBookingType] = useState('');
    const [memberType, setMemberType] = useState('');
    
    // Login related states
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    // Whole day booking states
    const [showWholeDaySummaryModal, setShowWholeDaySummaryModal] = useState(false);
    
    const [selectedSeating, setSelectedSeating] = useState('');
    const [showTimeSlotGridModal, setShowTimeSlotGridModal] = useState(false);
    
    // KYC related states for non-members (now mandatory)
    const [kycData, setKycData] = useState({
        identityProof: null,
        gstNumber: '',
        certificateOfIncorporation: null
    });

    // Error states for debounced validation
    const [gstError, setGstError] = useState('');
    
    const seatingOptions = [
        { id: 'C1', name: '4-6 Seater', capacity: 4-6 },
        { id: 'C2', name: '10-12 Seater', capacity:10-12}
    ];

    // Modify rooms data to include seating capacity
    const rooms = [
        { id: '307', name: 'Room 307', seating: 'C1' },
        { id: '630', name: 'Room 630', seating: 'C2' },
        { id: '730', name: 'Room 730', seating: 'C1' },
        { id: '420', name: 'Room 420', seating: 'C2' },
        { id: '170', name: 'Room 170', seating: 'C1' }
    ];

    // Mock data for booked rooms (in real app, this would come from backend)
    // Update the bookedRooms state with sample bookings
    const [bookedRooms, setBookedRooms] = useState({
        // Today's bookings
        // [`${format(new Date(), 'yyyy-MM-dd')}-09:00`]: ['307', '420'],
        // [`${format(new Date(), 'yyyy-MM-dd')}-12:00`]: ['630', '170'],
        // [`${format(new Date(), 'yyyy-MM-dd')}-15:00`]: ['730'],

        // Tomorrow's bookings
        [`${format(addDays(new Date(), 1), 'yyyy-MM-dd')}-10:30`]: ['307'],
        [`${format(addDays(new Date(), 1), 'yyyy-MM-dd')}-13:30`]: ['420', '630'],
        [`${format(addDays(new Date(), 1), 'yyyy-MM-dd')}-16:30`]: ['170'],

        // Day after tomorrow's bookings
        [`${format(addDays(new Date(), 2), 'yyyy-MM-dd')}-09:00`]: ['730'],
        [`${format(addDays(new Date(), 2), 'yyyy-MM-dd')}-12:00`]: ['307', '420'],
        [`${format(addDays(new Date(), 2), 'yyyy-MM-dd')}-15:00`]: ['630'],
    });

    // Add this function to calculate duration and price based on seating capacity
    const calculateDurationAndPrice = (start, end) => {
        if (!start || !end) return { duration: 0, subtotal: 0, gst: 0, total: 0 };

        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        
        const duration = (endHour + endMinute/60) - (startHour + startMinute/60);
        
        // Use the getBasePrice function for consistent pricing
        const basePrice = getBasePrice();
        
        const subtotal = Math.ceil(duration * basePrice);
        // const gst = subtotal * 0.18;
        
        return {
            duration,
            subtotal,
            // gst,
            total: subtotal
        };
    };

    // Function to get consecutive slots based on selected duration
    const getConsecutiveSlots = (startSlot, totalDurationMinutes) => {
        console.log('getConsecutiveSlots called with:', {
            startSlot,
            totalDurationMinutes,
            availableSlots: availableSlots.length
        });
        
        const slots = [];
        let remainingDuration = totalDurationMinutes;
        
        // Use all available slots
        const sortedSlots = availableSlots.sort((a, b) => a.start.localeCompare(b.start));
        
        // Find the starting slot
        const startIndex = sortedSlots.findIndex(slot => 
            slot.start === startSlot.start && slot.end === startSlot.end
        );
        
        console.log('Found start index:', startIndex);
        
        if (startIndex === -1) return [];
        
        // Get slot duration from API data (60 minutes for non-members, 30 for members typically)
        let slotDuration = 30; // default
        if (startSlot.duration) {
            const match = startSlot.duration.match(/(\d+)/);
            slotDuration = match ? parseInt(match[1]) : 30;
        }
        
        console.log('Slot duration detected:', slotDuration);
        
        // Collect consecutive slots
        for (let i = startIndex; i < sortedSlots.length && remainingDuration > 0; i++) {
            const slot = sortedSlots[i];
            
            // Check if this slot is available
            if (!isRoomAvailable('time1', selectedDate, slot.start, slot.end)) {
                console.log('Slot not available:', slot);
                break;
            }
            
            slots.push(slot);
            remainingDuration -= slotDuration;
            
            console.log('Added slot:', slot, 'Remaining duration:', remainingDuration);
            
            // Break if we have enough duration
            if (remainingDuration <= 0) break;
            
            // Check if next slot exists and is consecutive
            if (i + 1 < sortedSlots.length) {
                const nextSlot = sortedSlots[i + 1];
                if (slot.end !== nextSlot.start) {
                    console.log('Next slot not consecutive:', slot.end, '!=', nextSlot.start);
                    break; // Not consecutive
                }
            }
        }
        
        // Return slots only if we have enough for the requested duration
        const totalMinutes = slots.length * slotDuration;
        console.log('Final result:', {
            slotsCount: slots.length,
            totalMinutes,
            requiredMinutes: totalDurationMinutes,
            success: totalMinutes >= totalDurationMinutes
        });
        return totalMinutes >= totalDurationMinutes ? slots : [];
    };

    // Update time slot selection handler for duration-based booking
    const handleTimeSlotSelectionUnified = (slot) => {
        if (!isRoomAvailable('time1', selectedDate, slot.start, slot.end)) {
            return;
        }

        // Check if this slot is already selected
        const isAlreadySelected = selectedTimeSlots.some(s => 
            s.start === slot.start && s.end === slot.end
        );

        // Handle duration-based consecutive booking (30min - 7hr)
        if (selectedBookingDuration && selectedBookingDuration !== 'manual') {
            if (isAlreadySelected) {
                // If clicking on already selected slot, clear all selections
                setSelectedTimeSlots([]);
                setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
                setSelectedTime('');
                setSelectedEndTime('');
                return;
            }

            // Get consecutive slots based on selected booking duration
            const consecutiveSlots = getConsecutiveSlots(slot, selectedBookingDuration);
            
            console.log('Debug consecutive slots:', {
                selectedBookingDuration,
                startSlot: slot,
                foundSlots: consecutiveSlots.length,
                slots: consecutiveSlots
            });
            
            if (consecutiveSlots.length === 0) {
                alert(`Cannot find ${selectedBookingDuration} minutes of consecutive slots starting from ${slot.display}`);
                return;
            }

            // Set the new consecutive slots
            setSelectedTimeSlots(consecutiveSlots);
            
            // Calculate total price for all selected slots
            const totalPriceDetails = calculateTotalPrice(consecutiveSlots);
            setCalculatedPrice(totalPriceDetails);
            
            // Set the first selected slot's time as the main selected time
            setSelectedTime(consecutiveSlots[0].start);
            setSelectedEndTime(consecutiveSlots[consecutiveSlots.length - 1].end);
            return;
        }

        // Handle manual individual slot selection
        let newSelectedSlots;
        if (isAlreadySelected) {
            // Remove the slot if already selected
            newSelectedSlots = selectedTimeSlots.filter(s => 
                !(s.start === slot.start && s.end === slot.end)
            );
        } else {
            // Check if adding this slot would exceed the maximum allowed slots
            const maxSlots = memberType === 'Member' ? 3 : 4;
            
            if (selectedTimeSlots.length >= maxSlots) {
                alert(`Maximum ${maxSlots} slots allowed for ${memberType}`);
                return;
            }

            // Add the new slot
            newSelectedSlots = [...selectedTimeSlots, slot];
        }

        // Update selected slots
        setSelectedTimeSlots(newSelectedSlots);

        // Calculate total price
        const totalPriceDetails = calculateTotalPrice(newSelectedSlots);
        setCalculatedPrice(totalPriceDetails);

        // Set start and end times
        if (newSelectedSlots.length > 0) {
            const sortedSlots = [...newSelectedSlots].sort((a, b) => 
                a.start.localeCompare(b.start)
            );
            setSelectedTime(sortedSlots[0].start);
            setSelectedEndTime(sortedSlots[sortedSlots.length - 1].end);
        } else {
            setSelectedTime('');
            setSelectedEndTime('');
        }
    };

    // Legacy time slot selection handler (keeping for backward compatibility)
    const handleTimeSlotSelection = (slot) => {
        if (isRoomAvailable('time1', selectedDate, slot.start, slot.end)) {
            // Check if this slot is already selected
            const slotIndex = selectedTimeSlots.findIndex(
                s => s.start === slot.start && s.end === slot.end
            );
            
            let newSelectedSlots;
            if (slotIndex >= 0) {
                // If slot is already selected, remove it
                newSelectedSlots = selectedTimeSlots.filter((_, index) => index !== slotIndex);
            } else {
                // Check if adding this slot would exceed the maximum allowed slots
                const maxSlots = memberType === 'member' ? 3 : 4; // Max 3 slots for members, 4 for non-members
                
                if (selectedTimeSlots.length >= maxSlots) {
                    // Maximum slots already selected, don't add more
                    return;
                }
                
                // Add the new slot temporarily to check continuity
                const potentialSlots = [...selectedTimeSlots, slot];
                
                // Sort slots by start time
                const sortedSlots = [...potentialSlots].sort((a, b) => 
                    a.start.localeCompare(b.start)
                );
                
                // Check if all slots form a continuous sequence
                let isContinuous = true;
                for (let i = 0; i < sortedSlots.length - 1; i++) {
                    if (sortedSlots[i].end !== sortedSlots[i + 1].start) {
                        isContinuous = false;
                        break;
                    }
                }
                
                if (!isContinuous) {
                    alert("Please select consecutive time slots only");
                    return;
                }
                
                // If all checks pass, add the new slot
                newSelectedSlots = potentialSlots;
            }
            
            setSelectedTimeSlots(newSelectedSlots);
            
            // Calculate total price for all selected slots
            const totalPriceDetails = calculateTotalPrice(newSelectedSlots);
            setCalculatedPrice(totalPriceDetails);
            
            // Set the first selected slot's time as the main selected time (for backward compatibility)
            if (newSelectedSlots.length > 0) {
                setSelectedTime(newSelectedSlots[0].start);
                setSelectedEndTime(newSelectedSlots[0].end);
            } else {
                setSelectedTime('');
                setSelectedEndTime('');
            }
        }
    };

    

    // Get duration options based on member type
    const getDurationOptions = () => {
        // Base options for manual selection
        const baseOptions = [
            { id: 'manual', label: 'Manual Selection', slots: 'custom' }
        ];

        // Member-specific duration options
        if (memberType === 'Member') {
            // Members get 30min option plus all hourly options (no whole day)
            return [
                ...baseOptions,
                { id: 30, label: '30 min', slots: 1 },
                { id: 60, label: '1 hr', slots: 2 },
                { id: 120, label: '2 hr', slots: 4 },
                { id: 180, label: '3 hr', slots: 6 },
                { id: 240, label: '4 hr', slots: 8 },
                { id: 300, label: '5 hr', slots: 10 },
                { id: 360, label: '6 hr', slots: 12 },
                { id: 420, label: '7 hr', slots: 14 }
            ];
        } else if (memberType === 'Non-Member') {
            // Non-members get only hourly options (no 30min, no whole day)
            return [
                ...baseOptions,
                { id: 60, label: '1 hr', slots: 2 },
                { id: 120, label: '2 hr', slots: 4 },
                { id: 180, label: '3 hr', slots: 6 },
                { id: 240, label: '4 hr', slots: 8 },
                { id: 300, label: '5 hr', slots: 10 },
                { id: 360, label: '6 hr', slots: 12 },
                { id: 420, label: '7 hr', slots: 14 }
            ];
        }

        // Default fallback (shouldn't happen if memberType is properly set)
        return baseOptions;
    };
    
    // Calculate total price for all selected time slots
    const calculateTotalPrice = (slots) => {
        if (!slots || slots.length === 0) {
            return { duration: 0, subtotal: 0, gst: 0, total: 0 };
        }
        
        const totalDetails = slots.reduce((acc, slot) => {
            const slotDetails = calculateDurationAndPrice(slot.start, slot.end);
            return {
                duration: acc.duration + slotDetails.duration,
                subtotal: acc.subtotal + slotDetails.subtotal,
                gst: acc.gst + slotDetails.gst,
                total: acc.total + slotDetails.total
            };
        }, { duration: 0, subtotal: 0, gst: 0, total: 0 });
        
        return totalDetails;
    };

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState({ subtotal: 0, gst: 0, total: 0, duration: 0 });
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [selectedBookingDuration, setSelectedBookingDuration] = useState('manual'); // Default to manual selection
    // Add a new state to track the date window start
    const [dateWindowStart, setDateWindowStart] = useState(new Date());
    // Add state for total duration selection
    const [selectedTotalDuration, setSelectedTotalDuration] = useState(30);
    // Add state for hover preview
    const [hoveredSlot, setHoveredSlot] = useState(null);

    // Update timeSlots to include 30-minute and 1-hour intervals
    const timeSlots = Array.from({ length: 19 }, (_, i) => {
        const hour = Math.floor(i / 2) + 9;
        const minutes = (i % 2) * 30;
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return {
            display: `${time}${hour < 12 ? 'AM' : 'PM'}`,
            value: time
        };
    });

    // Get available time slots for members
    const getMemberTimeSlots = () => {
        const slots = [];
        for (let i = 0; i < timeSlots.length - 1; i++) {
            const startTime = timeSlots[i].value;
            const endTime30 = timeSlots[i + 1].value;
            const endTime60 = i < timeSlots.length - 2 ? timeSlots[i + 2].value : null;
            
            slots.push({
                start: startTime,
                end: endTime30,
                duration: '30 minutes',
                display: `${timeSlots[i].display} - ${timeSlots[i + 1].display}`
            });

            if (endTime60) {
                slots.push({
                    start: startTime,
                    end: endTime60,
                    duration: '1 hour',
                    display: `${timeSlots[i].display} - ${timeSlots[i + 2].display}`
                });
            }
        }
        return slots;
    };

    // Calculate dates from the date window start
    const getAvailableDates = () => {
        const dates = [];
        if (dateWindowStart) {
            for (let i = 0; i < 3; i++) {
                const date = new Date(dateWindowStart);
                date.setDate(dateWindowStart.getDate() + i);
                dates.push(date);
            }
        }
        return dates;
    };

    // Add functions to navigate date window
    const goToPreviousDates = () => {
        const newStartDate = new Date(dateWindowStart);
        newStartDate.setDate(dateWindowStart.getDate() - 3);
        
        // Prevent going before current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (newStartDate < today) {
            setDateWindowStart(today);
        } else {
            setDateWindowStart(newStartDate);
        }
    };

    const goToNextDates = () => {
        const newStartDate = new Date(dateWindowStart);
        newStartDate.setDate(dateWindowStart.getDate() + 3);
        setDateWindowStart(newStartDate);
    };

    // Update price calculation based on seating capacity
    const calculatePrice = (start, end) => {
        if (!start || !end) return 0;
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        const duration = (endHour - startHour) + (endMinute - startMinute) / 60;
        
        // Use the getBasePrice function for consistent pricing
        const basePrice = getBasePrice();
        
        const subtotal = Math.ceil(duration * basePrice);
        const gst = subtotal * 0.18;
        return {
            subtotal,
            gst,
            total: subtotal + gst,
            duration
        };
    };

    const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);

    const handleCalendarClick = (event) => {
        setCalendarAnchorEl(event.currentTarget);
    };

    const handleCalendarClose = () => {
        setCalendarAnchorEl(null);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        handleCalendarClose();
        
        // If in hourly booking mode, set up time slots based on member type
        if (bookingType === 'hourly' && memberType) {
            if (memberType === 'member') {
                setAvailableTimeSlots(generateTimeSlots(selectedDuration, 'member'));
            } else if (memberType === 'non_member') {
                setAvailableTimeSlots(generateTimeSlots('1hour', 'non_member'));
            }
        }
    };

    // Calculate min and max dates
    const minDate = new Date(); // Current date
    const maxDate = endOfMonth(addMonths(new Date(), 2)); // End of the month after next

    // Add this state for reason selection
    const [selectedReason, setSelectedReason] = useState('');

    // Add the reasons array
    const meetingReasons = [
        { id: 'team', name: 'Team Meeting' },
        { id: 'client', name: 'Client Meeting' },
        { id: 'others', name: 'Others' }
    ];

    // Update the RoomSelectionContent component
    const RoomSelectionContent = () => (
        <>
            <Typography variant="h6" gutterBottom>
                Select Time Slot
            </Typography>

            {/* Date Selection Tabs with Navigation */}
            <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 4,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Button
                    onClick={goToPreviousDates}
                    variant="outlined"
                    sx={{ 
                        minWidth: 40, 
                        borderRadius: '50%',
                        p: 1
                    }}
                >
                    &lt;
                </Button>
                
                {getAvailableDates().map((date) => (
                    <Button
                        key={format(date, 'yyyy-MM-dd')}
                        variant={selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                            ? "contained" 
                            : "outlined"
                        }
                        onClick={() => {
                            console.log('Date selected:', {
                                date: format(date, 'yyyy-MM-dd'),
                                memberType,
                                selectedSeating
                            });
                            setSelectedDate(date);
                            // fetchAvailableSlots will be called by useEffect
                        }}
                        sx={{
                            minWidth: 120,
                            background: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                ? 'linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%)'
                                : 'transparent'
                        }}
                    >
                        {format(date, 'dd MMM yyyy')}
                    </Button>
                ))}
                
                <Button
                    onClick={goToNextDates}
                    variant="outlined"
                    sx={{ 
                        minWidth: 40, 
                        borderRadius: '50%',
                        p: 1
                    }}
                >
                    &gt;
                </Button>
            </Box>

            {isLoadingSlots ? (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, #4CAF50, #81C784, #4CAF50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'spin 2s linear infinite',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                        }
                    }}>
                        <Box sx={{
                            width: 45,
                            height: 45,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            ⏰
                        </Box>
                    </Box>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        Finding Available Slots...
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', maxWidth: '300px' }}>
                        We're checking the best time slots for your meeting
                    </Typography>
                </Box>
            ) : (
                <>
                        {/* Time Slots Header */}
                <Box sx={{ 
                    mb: 3,
                            p: 3,
                            bgcolor: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                            borderRadius: '16px',
                            border: '1px solid rgba(76, 175, 80, 0.2)'
                        }}>
                            <Typography variant="h6" sx={{ 
                                color: '#2E7D32', 
                                fontWeight: 'bold',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                🕐 Available Time Slots
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4CAF50', mb: 2 }}>
                                Choose "Manual Selection" to pick individual slots, or select a duration ({memberType === 'Member' ? '30min-7hr' : '1hr-7hr'}) for automatic consecutive booking
                            </Typography>

                            {/* Duration Selector */}
                            <Box sx={{ 
                                mb: 3,
                                p: 3,
                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                                borderRadius: '16px',
                                border: '1px solid rgba(102, 126, 234, 0.15)'
                            }}>
                                <Typography variant="subtitle1" sx={{ 
                                    color: '#667eea', 
                                    fontWeight: 'bold',
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    ⏱️ Choose Meeting Duration
                                </Typography>
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 2, 
                                    flexWrap: 'wrap',
                                    alignItems: 'center'
                                }}>
                                    {[30, 60, 90, 120, 150, 180].map((minutes) => {
                                        const hours = Math.floor(minutes / 60);
                                        const remainingMinutes = minutes % 60;
                                        const displayText = hours > 0 
                                            ? `${hours}hr${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ''}`
                                            : `${minutes}min`;
                                        
                                        return (
                                            <Button
                                                key={minutes}
                                                variant={selectedTotalDuration === minutes ? "contained" : "outlined"}
                                                onClick={() => setSelectedTotalDuration(minutes)}
                                                sx={{
                                                    minWidth: '80px',
                                                    height: '40px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold',
                                                    background: selectedTotalDuration === minutes 
                                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                        : 'rgba(255, 255, 255, 0.8)',
                                                    color: selectedTotalDuration === minutes ? 'white' : '#667eea',
                                                    border: selectedTotalDuration === minutes 
                                                        ? 'none' 
                                                        : '2px solid rgba(102, 126, 234, 0.3)',
                                                    boxShadow: selectedTotalDuration === minutes 
                                                        ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                                                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: selectedTotalDuration === minutes 
                                                            ? '0 6px 20px rgba(102, 126, 234, 0.4)'
                                                            : '0 4px 15px rgba(102, 126, 234, 0.2)',
                                                        background: selectedTotalDuration === minutes 
                                                            ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                                                            : 'rgba(102, 126, 234, 0.1)'
                                                    }
                                                }}
                                            >
                                                {displayText}
                                            </Button>
                                        );
                                    })}
                                </Box>
                                <Typography variant="caption" sx={{ 
                                    color: '#667eea',
                                    fontStyle: 'italic',
                                    mt: 1,
                                    display: 'block'
                                }}>
                                    💡 Click any available time slot and we'll automatically book {selectedTotalDuration} minutes of consecutive slots
                                </Typography>
                            </Box>
                        
                        {/* Progress Bar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" sx={{ 
                                color: selectedTimeSlots.length > 0 ? '#4CAF50' : '#666', 
                                minWidth: 'fit-content',
                                fontWeight: selectedTimeSlots.length > 0 ? 'bold' : 'normal',
                                transition: 'all 0.3s ease'
                            }}>
                                {selectedTimeSlots.length > 0 
                                    ? `${selectedTimeSlots.length} slots (${selectedTotalDuration}min) selected`
                                    : 'No slots selected'
                                }
                            </Typography>
                            <Box sx={{ 
                                flex: 1, 
                                height: 8, 
                                bgcolor: 'rgba(76, 175, 80, 0.1)', 
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: selectedTimeSlots.length > 0 ? '1px solid #4CAF50' : 'none',
                                transition: 'border 0.3s ease'
                            }}>
                                <Box sx={{
                                    width: selectedTimeSlots.length > 0 ? '100%' : '0%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '4px',
                                    animation: selectedTimeSlots.length > 0 ? 'glow 1.5s ease-in-out infinite alternate' : 'none',
                                    '@keyframes glow': {
                                        '0%': { boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)' },
                                        '100%': { boxShadow: '0 0 15px rgba(76, 175, 80, 0.8)' }
                                    }
                                }} />
                            </Box>
                        </Box>
                    </Box>

                    {/* Enhanced Time Slots Grid */}
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 3,
                        mb: 4,
                        px: 2
                }}>
                    {availableSlots.map((slot, index) => {
                        const isSelected = selectedTimeSlots.some(s => s.start === slot.start && s.end === slot.end);
                            const isInPreview = hoveredSlot && getConsecutiveSlots(slot, selectedTotalDuration).some(s => 
                                s.start === slot.start && s.end === slot.end
                            );
                            const canSelect = true; // Always allow selection with duration-based booking
                        
                        return (
                            <Box
                                key={index}
                                    onClick={() => canSelect && handleTimeSlotSelectionUnified(slot)}
                                    onMouseEnter={() => setHoveredSlot(slot)}
                                    onMouseLeave={() => setHoveredSlot(null)}
                                sx={{
                                        position: 'relative',
                                    width: '100%',
                                        minHeight: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                        background: isSelected 
                                            ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                                            : isInPreview
                                                ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
                                                : 'linear-gradient(135deg, #F1F8E9 0%, #E8F5E8 100%)',
                                        border: isSelected 
                                            ? '2px solid #2E7D32' 
                                            : isInPreview
                                                ? '2px solid #1976D2'
                                                : '2px solid transparent',
                                        borderRadius: '16px',
                                        cursor: canSelect ? 'pointer' : 'not-allowed',
                                        boxShadow: isSelected 
                                            ? '0 8px 25px rgba(76, 175, 80, 0.3)'
                                            : isInPreview
                                                ? '0 8px 25px rgba(33, 150, 243, 0.3)'
                                                : '0 4px 15px rgba(0, 0, 0, 0.1)',
                                        transform: isSelected ? 'scale(1.05)' : isInPreview ? 'scale(1.03)' : 'scale(1)',
                                        '&:hover': canSelect ? {
                                            transform: 'scale(1.08) translateY(-4px)',
                                            boxShadow: isSelected 
                                                ? '0 12px 35px rgba(76, 175, 80, 0.4)'
                                                : isInPreview
                                                    ? '0 12px 35px rgba(33, 150, 243, 0.4)'
                                                    : '0 8px 25px rgba(76, 175, 80, 0.2)',
                                            background: isSelected 
                                                ? 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)'
                                                : isInPreview
                                                    ? 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
                                                    : 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)',
                                    } : {},
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        p: 2,
                                        overflow: 'hidden',
                                        
                                        // Animated background pattern
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: isSelected 
                                                ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                                                : 'radial-gradient(circle at 70% 70%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
                                            opacity: 0.8,
                                            transition: 'opacity 0.3s ease'
                                        }
                                    }}
                                >
                                    {/* Time Display */}
                                <Typography
                                    sx={{
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            color: isSelected ? 'white' : isInPreview ? 'white' : '#2E7D32',
                                            textAlign: 'center',
                                            mb: 1,
                                            position: 'relative',
                                            zIndex: 1,
                                            textShadow: (isSelected || isInPreview) ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                            letterSpacing: '0.5px'
                                    }}
                                >
                                    {slot.display}
                                </Typography>
                                    
                                    {/* Duration Badge */}
                                    <Box sx={{
                                        bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : isInPreview ? 'rgba(255,255,255,0.2)' : 'rgba(76, 175, 80, 0.2)',
                                        color: isSelected ? 'white' : isInPreview ? 'white' : '#2E7D32',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '20px',
                                            fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        position: 'relative',
                                        zIndex: 1,
                                        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : isInPreview ? 'rgba(255,255,255,0.3)' : 'rgba(76, 175, 80, 0.3)'}`,
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        {slot.duration}
                                    </Box>

                                    {/* Status Icon */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        bgcolor: isSelected ? 'rgba(255,255,255,0.3)' : isInPreview ? 'rgba(255,255,255,0.3)' : 'rgba(76, 175, 80, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        animation: (isSelected || isInPreview) ? 'pulse 2s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
                                            '70%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
                                            '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' }
                                        }
                                    }}>
                                        {isSelected ? '✓' : isInPreview ? '👁' : '○'}
                                    </Box>

                                    {/* Ripple Effect on Click */}
                                    {isSelected && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                                            transform: 'translate(-50%, -50%)',
                                            animation: 'ripple 1.5s infinite',
                                            '@keyframes ripple': {
                                                '0%': { 
                                                    width: '20px', 
                                                    height: '20px', 
                                                    opacity: 1 
                                                },
                                                '100%': { 
                                                    width: '100px', 
                                                    height: '100px', 
                                                    opacity: 0 
                                                }
                                            }
                                        }} />
                                )}
                            </Box>
                        );
                    })}
                </Box>
                </>
            )}

            {selectedTimeSlots.length > 0 && (
                <Box sx={{ 
                    mt: 4, 
                    p: 4, 
                    background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
                    borderRadius: '20px', 
                    border: '2px solid #4CAF50',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }
                }}>
                    {/* Header */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 3,
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <Typography variant="h6" sx={{ 
                            color: '#2E7D32', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            ✨ Selected Time Slots
                    </Typography>
                        <Box sx={{
                            bgcolor: '#4CAF50',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                        }}>
                            {selectedTimeSlots.length} Selected
                        </Box>
                    </Box>

                    {/* Selected Slots List */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2, 
                        mb: 3,
                        position: 'relative',
                        zIndex: 1
                    }}>
                    {selectedTimeSlots.map((slot, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.7)',
                                borderRadius: '12px',
                                border: '1px solid rgba(76, 175, 80, 0.2)',
                                backdropFilter: 'blur(10px)',
                                animation: `slideIn 0.5s ease ${index * 0.1}s both`,
                                '@keyframes slideIn': {
                                    '0%': { 
                                        opacity: 0, 
                                        transform: 'translateX(-20px)' 
                                    },
                                    '100%': { 
                                        opacity: 1, 
                                        transform: 'translateX(0)' 
                                    }
                                }
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        bgcolor: '#4CAF50',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                                    }}>
                                        {index + 1}
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" sx={{ 
                                            fontWeight: 'bold', 
                                            color: '#2E7D32',
                                            fontSize: '0.95rem'
                                        }}>
                                            {slot.display}
                        </Typography>
                                        <Typography variant="caption" sx={{ 
                                            color: '#4CAF50',
                                            fontSize: '0.75rem'
                                        }}>
                                            Duration: {slot.duration}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    p: 1,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{ 
                                        color: '#4CAF50', 
                                        fontSize: '1.2rem' 
                                    }}>
                                        ✓
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Price Summary */}
                    <Box sx={{
                        p: 3,
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        borderRadius: '16px',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        position: 'relative',
                        zIndex: 1,
                        backgroundImage: 'linear-gradient(45deg, rgba(76, 175, 80, 0.05) 25%, transparent 25%), linear-gradient(-45deg, rgba(76, 175, 80, 0.05) 25%, transparent 25%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 10px 10px'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{ 
                                color: '#2E7D32', 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                💰 Total Amount
                            </Typography>
                            <Typography variant="h5" sx={{ 
                                color: '#2E7D32', 
                                fontWeight: 'bold',
                                fontSize: '1.5rem',
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                ₹{Math.ceil(calculatedPrice.total)}/-
                    </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ 
                            color: '#4CAF50',
                            fontStyle: 'italic',
                            mt: 1,
                            display: 'block'
                        }}>
                            *Including GST and all charges
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Add Reason Dropdown for Member Type */}
            {memberType === 'Member' && selectedTimeSlots.length > 0 && (
                <FormControl fullWidth sx={{ mt: 3 }}>
                    <InputLabel>Select Reason</InputLabel>
                    <Select
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        label="Select Reason"
                    >
                        <MenuItem value="" disabled>
                            Select a reason
                        </MenuItem>
                        {meetingReasons.map((reason) => (
                            <MenuItem key={reason.id} value={reason.id}>
                                {reason.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Update the button text based on member type */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setShowRoomSelectionModal(false);
                        setShowTimeSlotModal(true);
                    }}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFinalBooking}
                    disabled={!selectedDate || selectedTimeSlots.length === 0 || (memberType === 'Member' && !selectedReason)}
                    sx={{
                        background: 'linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #6A5ACD 0%, #5B4ACE 100%)'
                        }
                    }}
                >
                    {memberType === 'Member' ? 'Book Now' : 'Proceed to Payment'}
                </Button>
            </Box>
        </>
    );

    // Add new state for confirmation modal
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // Update handleFinalBooking function
    const handleFinalBooking = async () => {
    const token = sessionStorage.getItem('authToken');
    console.log('Retrieved token from sessionStorage:', token);

        if (memberType === 'Non-Member') {
            setShowPaymentModal(true);
            return;
        }

        console.log('=== Starting handleFinalBooking ===');
        
        // Debug token storage
        console.log('=== Token Debug Info ===');
        // let token = null;
        
        try {
            // Get token from localStorage
            // token = localStorage.getItem('token');
            const userData = localStorage.getItem('userData');
            
            console.log('Raw userData from localStorage:', userData);

            // Check if we're actually logged in
            // if (!token) {
            //     console.error('Authentication required - No token found');
            //     alert('Please login to book a meeting room');
            //     navigate('/login');
            //     return;
            // }

            // Verify token format
            // if (token.startsWith('"') && token.endsWith('"')) {
            //     token = token.slice(1, -1); // Remove quotes if present
            // }

            // Comment out token usage to fix ESLint errors
            // console.log('Final token being used:', token);

            if (selectedDate && selectedTimeSlots.length > 0) {
                console.log('All required fields present, proceeding with booking');
                console.log('Selected time slots:', selectedTimeSlots);
                
                // For members, make API call
                if (memberType === 'Member') {
                    try {
                        // Validate time slots
                        if (selectedTimeSlots.length > 7) {
                            alert('For hourly bookings, you can only select up to 2 time slots (1 hour maximum).');
                            return;
                        }

                        // Format time slots to match API requirement
                        const formattedTimeSlots = selectedTimeSlots.map(slot => 
                            `${slot.start} - ${slot.end}`
                        );

                        // Set duration strictly to '30 Minutes' or '1 Hour'
                        const duration = selectedTimeSlots.length === 1 ? '30 Minutes' : '1 Hour';
                        console.log('Using duration:', duration);

                        // Prepare the request data exactly as per API requirement
                        const bookingData = {
                            capacityType: selectedSeating === 'C1' ? '4-6 Seater' : '10-12 Seater',
                            bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                            timeSlots: formattedTimeSlots,
                            duration: duration,
                            bookingType: 'Hourly',  // Always set to Hourly as per API requirement
                            memberType: memberType,
                            notes: selectedReason ? meetingReasons.find(r => r.id === selectedReason)?.name : ''
                        };

                        console.log('=== Booking Request Details ===');
                        console.log('API Endpoint:', 'https://api.boldtribe.in/api/meetingrooms/book');
                        console.log('Request Headers:', {
                             'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        });
                        console.log('Request Body:', bookingData);

                        // Make the API call
                        console.log('Making API call...');
                        const response = await axios.post(
                            'https://api.boldtribe.in/api/meetingrooms/book',
                            bookingData,
                            {
                                headers: {
                                     'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        console.log('=== API Response ===');
                        console.log('Status:', response.status);
                        console.log('Response Data:', response.data);

                        if (response.data.success) {
                            console.log('Booking successful, showing confirmation modal');
                            // Close all other modals first
                            setShowRoomSelectionModal(false);
                            setShowTimeSlotModal(false);
                            setShowBookingModal(false);
                            
                            // Show the confirmation modal
                            setShowConfirmationModal(true);
                        } else {
                            console.error('Booking failed:', response.data.message);
                            alert(response.data.message || 'Failed to book meeting room. Please try again.');
                        }
                    } catch (error) {
                        console.error('=== Error Details ===');
                        console.error('Error message:', error.message);
                        console.error('Error response:', error.response?.data);
                        console.error('Error status:', error.response?.status);
                        console.error('Error headers:', error.response?.headers);
                        
                        // Show a user-friendly error message
                        const errorMessage = error.response?.data?.message || error.message || 'Failed to book meeting room. Please try again.';
                        alert(errorMessage);
                        
                        if (error.response?.status === 401) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userData');
                            navigate('/login');
                        }
                    }
                } else {
                    console.log('Non-member booking, proceeding with WhatsApp flow');
                    // For non-members, proceed with existing WhatsApp flow
                    const formattedDate = format(selectedDate, "MMM dd, yyyy");
                    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                    const userName = userData.fullName || 'User';
                    
                    let timeSlotText;
                    let priceText;
                    
                    if (bookingType === 'Whole Day') {
                        timeSlotText = "Whole Day (09:00 to 18:00)";
                        priceText = `INR ${memberType === 'Member' ? '1800' : '2300'}/- (Including GST)`;
                    } else {
                        timeSlotText = selectedTimeSlots.map(slot => 
                            `${slot.start} to ${slot.end}`
                        ).join(', ');
                        priceText = `INR ${Math.ceil(calculatedPrice.total)}/- (Including GST)`;
                    }

                    const reasonText = memberType === 'Member' && selectedReason 
                        ? `\nReason: ${meetingReasons.find(r => r.id === selectedReason)?.name}`
                        : '';
                    
                    const message = encodeURIComponent(
                        `Hi, I am ${userName}. I want to book the meeting room as a ${memberType} on ${formattedDate} for the following time slots: ${timeSlotText}. Price: ${priceText}${reasonText}`
                    );

                    window.location.href = `https://wa.me/+917684836139?text=${message}`;
                }
            } else {
                console.error('Missing required fields:', {
                    selectedDate: !!selectedDate,
                    selectedTimeSlots: selectedTimeSlots.length
                });
                alert('Please select a date and at least one time slot.');
            }
        } catch (error) {
            console.error('Error handling booking:', error);
            alert('An unexpected error occurred. Please try again.');
        }
        console.log('=== End of handleFinalBooking ===');
    };

    // Get base price based on member type and seating capacity
    const getBasePrice = () => {
        // For whole day booking
        if (bookingType === 'Whole Day') {
            if (selectedSeating === 'C2') { // 10-12 Seater
                return memberType === 'member' ? 2500 : 3000;
            }
            return memberType === 'member' ? 1800 : 2300; // Default whole day pricing for 4-6 seater
        }
        
        // For hourly booking
        if (memberType === 'member') {
            // For members, price depends on seating capacity
            if (selectedSeating === 'C1') { // 4-6 Seater
                return 200;
            } else if (selectedSeating === 'C2') { // 10-12 Seater
                return 400;
            } else {
                return 400; // Default member price if no seating selected
            }
        }
        
        // For non-members, price depends on seating capacity
        if (memberType === 'non_member') {
            if (selectedSeating === 'C1') { // 4-6 Seater
                return 250;
            } else if (selectedSeating === 'C2') { // 10-12 Seater
                return 500;
            }
        }
        
        // Default for non-members if no seating selected
        return 500;
    };
    
    const getPricing = () => {
        return getBasePrice();
    };

    const handleBookNowClick = () => {
        setShowBookingModal(true);
    };

    const [roomTypes, setRoomTypes] = useState([]);
    const [isLoadingRoomTypes, setIsLoadingRoomTypes] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState('');

    // Add function to fetch room types
    const fetchRoomTypes = async () => {
        setIsLoadingRoomTypes(true);
        console.log('Fetching room types...');
        try {
            const response = await axios.get('https://api.boldtribe.in/api/meetingrooms/room-types');
            console.log('Room Types API Response:', response.data);
            
            if (response.data.success) {
                console.log('Successfully fetched room types:', response.data.data);
                setRoomTypes(response.data.data);
            } else {
                console.error('Failed to fetch room types. API returned:', response.data.message);
                // Set default room types if API fails
                setRoomTypes([
                    { id: 1, name: 'Standard Room' },
                    { id: 2, name: 'Conference Room' },
                    { id: 3, name: 'Meeting Room' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching room types:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Set default room types if API fails
            setRoomTypes([
                { id: 1, name: 'Standard Room' },
                { id: 2, name: 'Conference Room' },
                { id: 3, name: 'Meeting Room' }
            ]);
        } finally {
            setIsLoadingRoomTypes(false);
            console.log('Finished loading room types');
        }
    };

    // Single handleBookingSubmit function
    const handleBookingSubmit = () => {
        if (selectedDate) {
            // For whole day booking, set the calculated price directly
            if (bookingType === 'Whole Day') {
                const basePrice = getBasePrice();
                setCalculatedPrice({
                    duration: 9, // 9 hours (9am-6pm)
                    subtotal: basePrice,
                    gst: 0, // GST is already included
                    total: basePrice
                });
                
                // For whole day booking, create a single time slot for the whole day
                setSelectedTimeSlots([{
                    start: '09:00',
                    end: '18:00',
                    duration: 'Whole Day',
                    display: '09:00AM - 06:00PM'
                }]);
            }
            
            // Initialize date window with the selected date
            setDateWindowStart(selectedDate);
            
            // Fetch available slots for the selected date
            fetchAvailableSlots(selectedDate);
            
            setShowRoomSelectionModal(true);
            setShowTimeSlotModal(false);
        }
    };

    // Handle successful login for members
    const handleLoginSuccess = (userData) => {
        console.log('Member login successful:', userData);
        console.log('Post-login booking type check:', bookingType);
        setShowLoginModal(false);
        
        // After successful login, always show time slot modal first for date/seating selection
        console.log('Opening time slot modal after login');
        setShowTimeSlotModal(true);
    };

    // Handle login modal close
    const handleLoginClose = () => {
        setShowLoginModal(false);
    };

    const handleBookingTypeChange = (e) => {
        const newBookingType = e.target.value;
        console.log('Booking type changed to:', newBookingType);
        setBookingType(newBookingType);
        
        // Reset date and seating when booking type changes
        setSelectedDate(null);
        setSelectedSeating('');
        setSelectedTimeSlots([]);
        setAvailableTimeSlots([]);
        
        // Fetch pricing data when booking type changes if member type is already selected
        if (memberType && newBookingType) {
            // Use the exact values from the API response
            fetchPricingData(memberType, newBookingType, selectedSeating || 'C1');
        }
    };

    const [amenities, setAmenities] = useState({
        wifi: true,
        smartTv: true,
        whiteBoard: true
    });

    const amenitiesPrices = {
        wifi: 0,
        smartTv: 0,
        whiteBoard: 0
    };

    const calculateAmenitiesTotal = () => {
        return Object.entries(amenities).reduce((total, [item, selected]) => {
            return selected ? total + amenitiesPrices[item] : total;
        }, 0);
    };

    const handleAmenityChange = (event) => {
        setAmenities({
            ...amenities,
            [event.target.name]: event.target.checked
        });
    };

    // KYC utility functions
    const resetKYCData = () => {
        setKycData({
            identityProof: null,
            gstNumber: '',
            certificateOfIncorporation: null
        });
    };

    const validateGST = (gst) => {
        if (!gst) return true; // GST is optional
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        return gstRegex.test(gst);
    };

    // Validate KYC requirements for non-members
    const isKYCValid = () => {
        if (memberType !== 'Non-Member') return true; // KYC not required for members
        
        // Identity proof is mandatory for non-members
        if (!kycData.identityProof) {
            return false;
        }
        
        // GST validation if provided
        if (kycData.gstNumber && !validateGST(kycData.gstNumber)) {
            return false;
        }
        
        return true;
    };

    // Debounced validation for GST number
    useEffect(() => {
        const timer = setTimeout(() => {
            if (kycData.gstNumber) {
                if (!validateGST(kycData.gstNumber)) {
                    setGstError('Invalid GST format (e.g., 22AAAAA0000A1Z5)');
                } else {
                    setGstError('');
                }
            } else {
                setGstError('');
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [kycData.gstNumber]);

    const [selectedDuration, setSelectedDuration] = useState('30min');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

    // Function to generate time slots based on selected duration and member type
    const generateTimeSlots = (duration, memberType = null) => {
        const slots = [];
        const startHour = 9;
        const endHour = 18;
        const endMinute = 30; 
       console.log("memberType",memberType);
       console.log("duration",duration);
        // For members, show 30-minute and 1-hour slots between 9am-6pm
        // if (memberType === 'member') {
            
        // }
        // For non-members, only show 1-hour slots between 9am-6pm
        if (memberType === 'non_member') {
            for (let hour = startHour; hour < endHour; hour++) {
                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                
                const formattedStartTime = `${startTime}${hour < 12 ? 'AM' : 'PM'}`;
                const formattedEndTime = `${endTime}${(hour + 1) < 12 ? 'AM' : 'PM'}`;
                
                slots.push({
                    start: startTime,
                    end: endTime,
                    duration: '1 hour',
                    display: `${formattedStartTime} - ${formattedEndTime}`
                });
            }
            return slots;
        }

        // For members, show both 30-min and 1-hour options
        if (duration === '30min') {
            for (let hour = startHour; hour <= endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    if (hour === endHour && minute > endMinute) break;
                    
                    const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const endTime = minute === 30 
                        ? `${(hour + 1).toString().padStart(2, '0')}:00`
                        : `${hour.toString().padStart(2, '0')}:30`;
                    
                    const formattedStartTime = `${startTime}${hour < 12 ? 'AM' : 'PM'}`;
                    const formattedEndHour = minute === 30 ? hour + 1 : hour;
                    const formattedEndTime = `${endTime}${formattedEndHour < 12 ? 'AM' : 'PM'}`;
                    
                    slots.push({
                        start: startTime,
                        end: endTime,
                        duration: '30 minutes',
                        display: `${formattedStartTime} - ${formattedEndTime}`
                    });
                }
            }
        } else if (duration === '1hour') {
            for (let hour = startHour; hour < endHour; hour++) {
                const startTime = `${hour.toString().padStart(2, '0')}:00`;
                const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
                
                const formattedStartTime = `${startTime}${hour < 12 ? 'AM' : 'PM'}`;
                const formattedEndTime = `${endTime}${(hour + 1) < 12 ? 'AM' : 'PM'}`;
                
                slots.push({
                    start: startTime,
                    end: endTime,
                    duration: '1 hour',
                    display: `${formattedStartTime} - ${formattedEndTime}`
                });
            }
        }

        return slots;
    };
const handleHourlyMemberType = (memberType) => {
     
    if (memberType === 'member') {
        setMemberType('member'); // we need to check why this state not updating on time
        setSelectedDuration('30min');
        setAvailableTimeSlots(generateTimeSlots('30min', 'member'));
        // Clear selected time slots when changing member type
        setSelectedTimeSlots([]);
        setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
        // Reset date and seating when member type changes
        setSelectedDate(null);
        setSelectedSeating('');

    } else {
        setMemberType('non_member');
        setSelectedDuration('1hour');
        setAvailableTimeSlots(generateTimeSlots('1hour', 'non_member'));
        // Clear selected time slots when changing member type
        setSelectedTimeSlots([]);
        setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
        // Reset date and seating when member type changes
        setSelectedDate(null);
        setSelectedSeating('');
    }
};
    // Update handleTimeChange
    const handleTimeChange = (event) => {
        const time = event.target.value;
        setSelectedTime(time);
        setSelectedEndTime('');
        setSelectedTimeSlots([]);
        setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
    };

    // Update handleDurationChange
    const handleDurationChange = (event) => {
        const duration = event.target.value;
        setSelectedDuration(duration);
        //  setAvailableTimeSlots(generateTimeSlots(duration));
        setAvailableTimeSlots(generateTimeSlots(duration,memberType));
        setSelectedTime('');
        setSelectedEndTime('');
        setSelectedTimeSlots([]);
        setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
    };

    const [bookingTypes, setBookingTypes] = useState([]);
    const [isLoadingBookingTypes, setIsLoadingBookingTypes] = useState(false);

    // Add useEffect to fetch booking types when component mounts
    useEffect(() => {
        const fetchBookingTypes = async () => {
            setIsLoadingBookingTypes(true);
            console.log('Fetching booking types...');
            try {
                const response = await axios.get('https://api.boldtribe.in/api/meetingrooms/booking-types');
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    console.log('Successfully fetched booking types:', response.data.data);
                    setBookingTypes(response.data.data);
                } else {
                    console.error('Failed to fetch booking types. API returned:', response.data.message);
                    // Set default booking types if API fails
                    setBookingTypes([
                        { id: 1, name: 'Hourly' },
                        { id: 2, name: 'Whole Day' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching booking types:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                // Set default booking types if API fails
                setBookingTypes([
                    { id: 1, name: 'Hourly' },
                    { id: 2, name: 'Whole Day' }
                ]);
            } finally {
                setIsLoadingBookingTypes(false);
                console.log('Finished loading booking types');
            }
        };

        fetchBookingTypes();
    }, []);

    const [memberTypes, setMemberTypes] = useState([]);
    const [isLoadingMemberTypes, setIsLoadingMemberTypes] = useState(false);

    // Add useEffect to fetch member types when component mounts
    useEffect(() => {
        const fetchMemberTypes = async () => {
            setIsLoadingMemberTypes(true);
            console.log('Fetching member types...');
            try {
                const response = await axios.get('https://api.boldtribe.in/api/meetingrooms/member-types');
                console.log('Member Types API Response:', response.data);
                
                if (response.data.success) {
                    console.log('Successfully fetched member types:', response.data.data);
                    setMemberTypes(response.data.data);
                } else {
                    console.error('Failed to fetch member types. API returned:', response.data.message);
                    // Set default member types if API fails
                    setMemberTypes([
                        { id: 1, name: 'Member' },
                        { id: 2, name: 'Non-Member' }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching member types:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                // Set default member types if API fails
                setMemberTypes([
                    { id: 1, name: 'Member' },
                    { id: 2, name: 'Non-Member' }
                ]);
            } finally {
                setIsLoadingMemberTypes(false);
                console.log('Finished loading member types');
            }
        };

        fetchMemberTypes();
    }, []);

    // Add useEffect to re-fetch available slots when memberType, selectedSeating, or selectedDate changes
    useEffect(() => {
        if (selectedDate && memberType && selectedSeating) {
            console.log('Dependencies changed, re-fetching available slots:', {
                selectedDate: format(selectedDate, 'yyyy-MM-dd'),
                memberType,
                selectedSeating
            });
            fetchAvailableSlots(selectedDate);
        }
    }, [memberType, selectedSeating, selectedDate]);

    // Add useEffect to reset duration if it's incompatible with member type
    useEffect(() => {
        if (memberType === 'Non-Member' && selectedBookingDuration === 30) {
            // Non-members can't select 30min, reset to manual
            setSelectedBookingDuration('manual');
            setSelectedTimeSlots([]);
        }
    }, [memberType, selectedBookingDuration]);

    // Add useEffect to track whole day modal opening and log booking data
    useEffect(() => {
        if (showWholeDaySummaryModal) {
            console.log('=== Whole Day Summary Modal Opened ===');
            console.log('Booking Type:', bookingType);
            console.log('Member Type:', memberType);
            console.log('Selected Date:', selectedDate);
            console.log('Selected Seating:', selectedSeating);
            console.log('Seating Options:', seatingOptions);
            console.log('Is Authenticated:', isAuthenticated);
            console.log('=== End Debug Info ===');
        }
    }, [showWholeDaySummaryModal, bookingType, memberType, selectedDate, selectedSeating, isAuthenticated]);

    const [pricingData, setPricingData] = useState(null);
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);

    // Add function to fetch pricing data
    const fetchPricingData = async (memberType, bookingType, seatingCapacity) => {
        setIsLoadingPricing(true);
        console.log('Fetching pricing data...');
        try {
            // Format the parameters correctly
            const params = {
                capacityType: seatingCapacity === 'C1' ? '4-6 Seater' : '10-12 Seater',
                bookingType: bookingType,
                memberType: memberType
            };
            
            console.log('Fetching pricing with params:', params);
            const response = await axios.get('https://api.boldtribe.in/api/meetingrooms/pricing', { params });
            console.log('Pricing API Response:', response.data);
            
            if (response.data.success) {
                console.log('Successfully fetched pricing data:', response.data.data);
                setPricingData(response.data.data);
            } else {
                console.error('Failed to fetch pricing data. API returned:', response.data.message);
                // Set default pricing data if API fails
                setPricingData({
                    price: bookingType === 'Hourly' ? (memberType === 'Member' ? 200 : 250) : (memberType === 'Member' ? 1800 : 2300),
                    openTime: '09:00 AM',
                    closeTime: '06:00 PM',
                    bookingType: bookingType,
                    memberType: memberType
                });
            }
        } catch (error) {
            console.error('Error fetching pricing data:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Set default pricing data if API fails
            setPricingData({
                price: bookingType === 'Hourly' ? (memberType === 'Member' ? 200 : 250) : (memberType === 'Member' ? 1800 : 2300),
                openTime: '09:00 AM',
                closeTime: '06:00 PM',
                bookingType: bookingType,
                memberType: memberType
            });
        } finally {
            setIsLoadingPricing(false);
            console.log('Finished loading pricing data');
        }
    };

    // Update the member type selection handler
    const handleMemberTypeChange = (e) => {
        const selectedMemberType = e.target.value;  // Keep the exact case from the API
        setMemberType(selectedMemberType);
        console.log('Selected Member Type:', selectedMemberType);
        
        // Reset date and seating when member type changes
        setSelectedDate(null);
        setSelectedSeating('');
        setSelectedTimeSlots([]);
        setAvailableTimeSlots([]);
        
        // Set default duration (manual selection for all users)
        setSelectedBookingDuration('manual');

        // Fetch pricing data when member type changes if booking type is already selected
        if (selectedMemberType && bookingType) {
            // Use the exact values from the API response
            fetchPricingData(selectedMemberType, bookingType, selectedSeating || 'C1');
        }
    };

    // Update the seating capacity change handler
    const handleSeatingChange = (e) => {
        const newSeating = e.target.value;
        setSelectedSeating(newSeating);
        
        // Fetch pricing data when seating changes if both member type and booking type are selected
        if (memberType && bookingType) {
            fetchPricingData(memberType, bookingType, newSeating);
        }
    };

    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    // Update the fetchAvailableSlots function
    const fetchAvailableSlots = async (date) => {
        // Validate required parameters
        if (!memberType || !selectedSeating) {
            console.log('Missing required parameters for fetchAvailableSlots:', {
                memberType,
                selectedSeating
            });
            return;
        }

        setIsLoadingSlots(true);
        console.log('Fetching available slots...');
        
        const params = {
            date: format(date, 'yyyy-MM-dd'),
            capacityType: selectedSeating === 'C1' ? '4-6 Seater' : '10-12 Seater',
            memberType: memberType === 'Member' ? 'member' : 'non-member'
        };
        
        console.log('API Parameters:', params);
        
        try {
            const response = await axios.get(`https://api.boldtribe.in/api/meetingrooms/available-slots`, {
                params
            });
            console.log('Available Slots API Response:', response.data);
            
            if (response.data.success && response.data.data.availableSlots) {
                console.log('Successfully fetched available slots:', response.data.data.availableSlots);
                // Transform the time slots into the required format
                const formattedSlots = response.data.data.availableSlots.map(slot => {
                    const [start, end] = slot.split(' - ');
                    return {
                        start,
                        end,
                        duration: response.data.data.slotDuration || '30 minutes',
                        display: slot
                    };
                });
                setAvailableSlots(formattedSlots);
            } else {
                console.error('Failed to fetch available slots. API returned:', response.data.message);
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error('Error fetching available slots:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setAvailableSlots([]);
        } finally {
            setIsLoadingSlots(false);
            console.log('Finished loading available slots');
        }
    };

    // Add back the isRoomAvailable function
    const isRoomAvailable = (roomId, date, startTime, endTime) => {
        if (!date || !startTime || !endTime) return true;
        
        // Mock availability check (replace with your backend logic)
        const timeKey = `${format(date, 'yyyy-MM-dd')}-${startTime}-${endTime}`;
        return !bookedRooms[timeKey]?.includes(roomId);
    };

    // Add back the addNewBooking function
    const addNewBooking = (date, startTime, roomId) => {
        const timeKey = `${format(date, 'yyyy-MM-dd')}-${startTime}`;
        setBookedRooms(prevBookings => ({
            ...prevBookings,
            [timeKey]: [...(prevBookings[timeKey] || []), roomId]
        }));
    };

    // Update the Confirmation Modal component
    const ConfirmationModal = () => (
        <Modal
            open={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            closeAfterTransition
            aria-labelledby="confirmation-modal"
            aria-describedby="confirmation-modal-description"
        >
            <Fade in={showConfirmationModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '80%', md: 400 },
                    bgcolor: 'background.paper',
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: 24,
                    p: { xs: 2, sm: 3, md: 4 },
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
                    zIndex: 9999
                }}>
                    <IconButton
                        onClick={() => setShowConfirmationModal(false)}
                        sx={{
                            position: 'absolute',
                            right: { xs: 4, sm: 8 },
                            top: { xs: 4, sm: 8 },
                            color: 'gray'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <PendingIcon sx={{ 
                            fontSize: { xs: '3rem', sm: '4rem', md: '60px' }, 
                            color: '#FFA500',
                            animation: 'spin 2s linear infinite',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }} />
                    </Box>

                    <Typography variant="h5" component="h2" sx={{ 
                        mb: { xs: 2, sm: 3 },
                        color: '#FFA500',
                        fontWeight: 'bold'
                    }}>
                        Pending
                    </Typography>

                    <Typography variant="body1" sx={{ mb: { xs: 2, sm: 3 } }}>
                        You will receive a confirmation email for the booking of the meeting room within an hour.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowConfirmationModal(false);
                            // Reset all form states
                            setSelectedDate(null);
                            setSelectedTimeSlots([]);
                            setSelectedReason('');
                            setSelectedRoom(null);
                            setShowBookingModal(false);
                            setShowTimeSlotModal(false);
                            setShowRoomSelectionModal(false);
                        }}
                        sx={{
                            background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #FF8C00 0%, #FF7F00 100%)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Fade>
        </Modal>
    );

    // New state variables for payment flow
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [paymentReceipt, setPaymentReceipt] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);

    // Add new function to handle Non-Member booking submission
    const handleNonMemberBooking = async () => {
        try {
            // Get auth token from sessionStorage (where it's typically stored after login)
            const authToken = sessionStorage.getItem('token') || localStorage.getItem('token');
            
            // Format time slots as required by the API
            const formattedTimeSlots = selectedTimeSlots.map(slot => 
                `${slot.start} - ${slot.end}`
            );

            // Set duration based on number of slots
            const duration = selectedTimeSlots.length === 1 ? '30 Minutes' : '1 Hour';

            // Prepare the booking data in the required format
            const bookingData = {
                capacityType: selectedSeating === 'C1' ? '4-6 Seater' : '10-12 Seater',
                bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                timeSlots: formattedTimeSlots,
                duration: duration,
                bookingType: 'Hourly',  // Always set to Hourly as per API requirement
                memberType: 'Non-Member',
                notes: "Meeting room booking",
                paymentMethod: paymentMethod,
                totalAmount: calculatedPrice.total,
                paymentReceipt: paymentReceipt ? await convertFileToBase64(paymentReceipt) : null
            };

            // Log the request data
            console.log('=== Booking Request Data ===');
            console.log('API Endpoint:', 'https://api.boldtribe.in/api/meetingrooms/book');
            console.log('Request Headers:', {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            });
            console.log('Request Body:', bookingData);
            console.log('===========================');

            // Make the API call with auth token
            const response = await axios.post(
                'https://api.boldtribe.in/api/meetingrooms/book',
                bookingData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                }
            );

            console.log('=== API Response ===');
            console.log('Status:', response.status);
            console.log('Response Data:', response.data);
            console.log('===================');

            if (response.data.success) {
                console.log('Booking submitted successfully!');
                // Close all other modals first
                setShowPaymentModal(false);
                setShowSummaryModal(false);
                
                // Show the pending modal
                setShowPendingModal(true);
                // Store booking details
                localStorage.setItem('lastBookingDetails', JSON.stringify(response.data.data));
                // Reset form
                resetFormData();
            } else {
                throw new Error(response.data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('=== Error submitting non-member booking ===');
            console.error('Error message:', error.message);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                
                if (error.response.status === 401) {
                    alert('Session expired. Please login again.');
                } else {
                    alert(error.response.data.message || 'Failed to submit booking. Please try again.');
                }
            } else {
                console.error('Error:', error);
                alert('Network error. Please check your connection and try again.');
            }
            console.error('=====================================');
        }
    };

    // Helper function to convert file to base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    // Helper function to reset form data
    const resetFormData = () => {
        setSelectedTimeSlots([]);
        setSelectedRoom(null);
        setSelectedDate(null);
        setSelectedTime('');
        setSelectedEndTime('');
        setPaymentMethod('UPI');
        setPaymentReceipt(null);
        setPaymentAmount(0);
        setCalculatedPrice({ subtotal: 0, gst: 0, total: 0, duration: 0 });
    };

    // Modify the Summary Modal to handle form submission
    const SummaryModal = () => (
        <Modal
            open={showSummaryModal}
            onClose={() => setShowSummaryModal(false)}
            aria-labelledby="summary-modal"
            aria-describedby="summary-modal-description"
        >
            <Fade in={showSummaryModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '80%', md: 400 },
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: { xs: 2, sm: 3, md: 4 },
                    borderRadius: { xs: 2, sm: 3 },
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" component="h2">
                            Payment Summary
                        </Typography>
                        <IconButton onClick={() => setShowSummaryModal(false)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                            <strong>Mode of Payment:</strong> {paymentMethod}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                            <strong>Amount Paid:</strong> ₹{paymentAmount}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                            <strong>Upload Payment Receipt:</strong>
                        </Typography>
                        <Input
                            type="file"
                            fullWidth
                            onChange={(e) => setPaymentReceipt(e.target.files[0])}
                            sx={{ mb: { xs: 2, sm: 3 } }}
                            inputProps={{
                                accept: 'image/*,.pdf'
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: { xs: 1, sm: 2 } }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => setShowSummaryModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained"
                            disabled={!paymentReceipt}
                            onClick={async () => {
                                setShowSummaryModal(false);
                                await handleNonMemberBooking();
                            }}
                        >
                            Proceed to Book
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );

    // Modify the Pending Modal to show API response status
    const PendingModal = () => {
        const lastBooking = JSON.parse(localStorage.getItem('lastBookingDetails') || '{}');
        
        return (
            <Modal
                open={showPendingModal}
                onClose={() => setShowPendingModal(false)}
                aria-labelledby="pending-modal"
                aria-describedby="pending-modal-description"
            >
                <Fade in={showPendingModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: 400 },
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 2, sm: 3, md: 4 },
                        borderRadius: { xs: 2, sm: 3 },
                        textAlign: 'center'
                    }}>
                        <PendingIcon sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '60px' }, color: 'primary.main', mb: { xs: 2, sm: 3 } }} />
                        <Typography variant="h6" component="h2" sx={{ mb: { xs: 2, sm: 3 } }}>
                            Booking Submitted Successfully
                        </Typography>
                        
                        {lastBooking.booking && (
                            <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'left' }}>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Booking ID:</strong> {lastBooking.booking.id}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Room:</strong> {lastBooking.roomName}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Date:</strong> {lastBooking.booking.bookingDate}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Time Slots:</strong> {lastBooking.booking.timeSlots.join(', ')}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Total Amount:</strong> ₹{lastBooking.totalAmount}/-
                                </Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 1, sm: 2 } }}>
                                    <strong>Status:</strong> {lastBooking.booking.status}
                                </Typography>
                            </Box>
                        )}

                        <Typography variant="body1" sx={{ mb: { xs: 2, sm: 3 } }}>
                            Your booking request has been submitted and is pending approval. 
                            We will notify you once it's confirmed.
                        </Typography>
                        <Button 
                            variant="contained"
                            onClick={() => {
                                setShowPendingModal(false);
                                window.location.reload();
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        );
    };

    // Payment Modal Component
    const PaymentModal = () => (
        <Modal
            open={showPaymentModal}
            onClose={() => {
                setShowPaymentModal(false);
                resetKYCData();
            }}
            aria-labelledby="payment-modal"
            aria-describedby="payment-modal-description"
        >
            <Fade in={showPaymentModal}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: '80%', md: 400 },
                    maxHeight: '90vh',
                    bgcolor: 'background.paper',
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: 24,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: { xs: 2, sm: 3, md: 4 },
                        '&::-webkit-scrollbar': {
                            width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                            '&:hover': {
                                background: '#555'
                            }
                        }
                    }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" component="h2">
                            Select Payment Method
                        </Typography>
                        <IconButton onClick={() => {
                            setShowPaymentModal(false);
                            resetKYCData();
                        }} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                    {/* Display Room Details */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="subtitle2" sx={{ mb: { xs: 1, sm: 2 } }}>
                            Room: Room {selectedRoom}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mb: { xs: 1, sm: 2 } }}>
                            Capacity: {selectedSeating}
                        </Typography>
                    </Box>

                    {/* Display Selected Time Slots */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 2 } }}>
                            Selected Time Slots: ({selectedTimeSlots.length})
                        </Typography>
                        {selectedTimeSlots.map((slot, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: { xs: 1, sm: 2 } }}>
                                {slot.start} - {slot.end} 
                            </Typography>
                        ))}
                    </Box>
                    
                    {/* KYC Section for Non-Members - MANDATORY */}
                    {memberType === 'Non-Member' && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: '#d32f2f' }}>
                                📋 KYC Details Required *
                            </Typography>
                            
                            <Card sx={{
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: 2,
                                p: 2,
                                mb: 2
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ 
                                    fontWeight: 'bold',
                                    color: '#667eea',
                                    mb: 2
                                }}>
                                    🏢 Business Information
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                            🆔 Identity Proof (PAN/Aadhaar/Any ID) *
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            sx={{
                                                borderColor: '#667eea',
                                                color: '#667eea',
                                                '&:hover': {
                                                    borderColor: '#764ba2',
                                                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                                                }
                                            }}
                                        >
                                            {kycData.identityProof 
                                                ? `Selected: ${kycData.identityProof.name}`
                                                : 'Upload Identity Proof *'
                                            }
                                            <input
                                                hidden
                                                accept="image/*,.pdf"
                                                type="file"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        setKycData({...kycData, identityProof: e.target.files[0]});
                                                    }
                                                }}
                                            />
                                        </Button>
                                        {kycData.identityProof && (
                                            <Typography variant="caption" sx={{ 
                                                display: 'block', 
                                                mt: 1, 
                                                color: '#667eea' 
                                            }}>
                                                ✅ File selected: {kycData.identityProof.name}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ 
                                            display: 'block', 
                                            mt: 1, 
                                            color: '#666',
                                            fontStyle: 'italic'
                                        }}>
                                            Accepted: PAN Card, Aadhaar Card, Passport, Driving License
                                        </Typography>
                                    </Box>
                                    
                                    <TextField
                                        label="GST Number (Optional)"
                                        value={kycData.gstNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase();
                                            setKycData({...kycData, gstNumber: value});
                                            
                                            // Validate GST format if provided
                                            if (value) {
                                                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                                                if (!gstRegex.test(value)) {
                                                    setGstError('Invalid GST format. Please enter valid GSTIN (15 characters)');
                                                } else {
                                                    setGstError('');
                                                }
                                            } else {
                                                setGstError('');
                                            }
                                        }}
                                        error={Boolean(gstError)}
                                        helperText={gstError}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#667eea',
                                            },
                                        }}
                                    />
                                    
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: '500' }}>
                                            📄 Certificate of Incorporation (Optional)
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            fullWidth
                                            sx={{
                                                borderColor: '#667eea',
                                                color: '#667eea',
                                                '&:hover': {
                                                    borderColor: '#764ba2',
                                                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                                                }
                                            }}
                                        >
                                            {kycData.certificateOfIncorporation 
                                                ? `Selected: ${kycData.certificateOfIncorporation.name}`
                                                : 'Upload Certificate'
                                            }
                                            <input
                                                hidden
                                                accept="image/*,.pdf"
                                                type="file"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        setKycData({...kycData, certificateOfIncorporation: e.target.files[0]});
                                                    }
                                                }}
                                            />
                                        </Button>
                                        {kycData.certificateOfIncorporation && (
                                            <Typography variant="caption" sx={{ 
                                                display: 'block', 
                                                mt: 1, 
                                                color: '#667eea' 
                                            }}>
                                                ✅ File selected: {kycData.certificateOfIncorporation.name}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                
                                <Box sx={{ 
                                    mt: 2, 
                                    p: 1.5, 
                                    background: 'rgba(211, 47, 47, 0.1)', 
                                    borderRadius: 1,
                                    border: '1px solid rgba(211, 47, 47, 0.2)'
                                }}>
                                    <Typography variant="caption" sx={{ 
                                        color: '#d32f2f',
                                        display: 'block',
                                        lineHeight: 1.4,
                                        fontWeight: 'bold'
                                    }}>
                                        ⚠️ <strong>Important:</strong> Identity proof upload is mandatory for all non-member bookings. You cannot proceed to payment without uploading a valid identity document (PAN/Aadhaar/Passport/Driving License).
                                    </Typography>
                                </Box>
                            </Card>
                        </Box>
                    )}
                    
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <FormControlLabel 
                                value="UPI" 
                                control={<Radio />} 
                                label="UPI Payment"
                                sx={{ mb: { xs: 1, sm: 2 } }}
                            />
                            <FormControlLabel 
                                value="NET_BANKING" 
                                control={<Radio />} 
                                label="Net Banking"
                                sx={{ mb: { xs: 1, sm: 2 } }}
                            />
                        </RadioGroup>
                    </FormControl>

                    <Box sx={{ mt: { xs: 2, sm: 3 } }}>
                        <Typography variant="subtitle1" sx={{ mb: { xs: 1, sm: 2 } }}>
                            Total Price: ₹{calculatedPrice.total}/- (Including GST)
                        </Typography>
                    </Box>

                    <Box sx={{ mt: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'flex-end', gap: { xs: 1, sm: 2 } }}>
                        <Button 
                            variant="outlined" 
                            onClick={() => {
                                setShowPaymentModal(false);
                                resetKYCData();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled={!isKYCValid()}
                            onClick={() => {
                                console.log('=== Payment Details Selected ===');
                                console.log('Room ID:', selectedRoom);
                                console.log('Member Type:', memberType);
                                console.log('Selected Time Slots:', selectedTimeSlots.length);
                                selectedTimeSlots.forEach((slot, index) => {
                                    console.log(`Slot ${index + 1}: ${slot.start} - ${slot.end} (30 Minutes)`);
                                });
                                console.log('Selected Payment Method:', paymentMethod);
                                console.log('Total Amount (Including GST):', calculatedPrice.total);
                                
                                // Log KYC data for non-members (now mandatory)
                                if (memberType === 'Non-Member') {
                                    console.log('=== KYC Details (Required) ===');
                                    console.log('Identity Proof:', kycData.identityProof ? kycData.identityProof.name : 'Not provided');
                                    console.log('GST Number:', kycData.gstNumber || 'Not provided');
                                    console.log('Certificate of Incorporation:', kycData.certificateOfIncorporation ? kycData.certificateOfIncorporation.name : 'Not provided');
                                    console.log('==============================');
                                }
                                console.log('============================');
                                
                                setPaymentAmount(calculatedPrice.total);
                                setShowPaymentModal(false);
                                setShowSummaryModal(true);
                            }}
                            sx={{
                                opacity: !isKYCValid() ? 0.6 : 1,
                                '&.Mui-disabled': {
                                    backgroundColor: '#ccc',
                                    color: '#999'
                                }
                            }}
                        >
                            {!isKYCValid() && memberType === 'Non-Member' 
                                ? 'Upload Identity Proof to Pay' 
                                : 'Proceed to Pay'
                            }
                        </Button>
                    </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );

    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: { xs: 1, sm: 2 },
                    pb: { xs: 0.5, sm: 1 },
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${bookMeetingRoomImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.4) blur(2px)',
                        animation: 'slowFloat 20s ease-in-out infinite',
                        zIndex: 0
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.6) 100%)',
                        zIndex: 1
                    },
                    '@keyframes slowFloat': {
                        '0%, 100%': { transform: 'scale(1) translateY(0px)' },
                        '33%': { transform: 'scale(1.05) translateY(-10px)' },
                        '66%': { transform: 'scale(1.02) translateY(5px)' },
                    },
                }}
            >
                {/* Floating Animation Elements */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    overflow: 'hidden',
                    pointerEvents: 'none'
                }}>
                    {/* Floating particles */}
                    {[...Array(12)].map((_, i) => (
                        <Box
                            key={i}
                    sx={{
                                position: 'absolute',
                                width: '4px',
                                height: '4px',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '50%',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float${i % 3} ${8 + Math.random() * 6}s ease-in-out infinite`,
                                '@keyframes float0': {
                                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: 0.6 },
                                    '50%': { transform: 'translateY(-30px) translateX(15px)', opacity: 1 },
                                },
                                '@keyframes float1': {
                                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: 0.4 },
                                    '50%': { transform: 'translateY(25px) translateX(-10px)', opacity: 0.8 },
                                },
                                '@keyframes float2': {
                                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: 0.5 },
                                    '50%': { transform: 'translateY(-20px) translateX(20px)', opacity: 0.9 },
                                },
                            }}
                        />
                    ))}
                </Box>
                {/* Modern Logo Section */}
                <Box
                    sx={{
                        mb: { xs: 3, sm: 4, md: 5 },
                        position: 'relative',
                        zIndex: 3,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        width: '100%',
                        marginTop: { xs: '2rem', sm: '3rem' },
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: '120%',
                                height: '120%',
                                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                                borderRadius: '50%',
                                animation: 'logoGlow 3s ease-in-out infinite alternate',
                                zIndex: -1
                            },
                            '@keyframes logoGlow': {
                                '0%': { transform: 'scale(1)', opacity: 0.5 },
                                '100%': { transform: 'scale(1.1)', opacity: 0.8 },
                        },
                    }}
                >
                        <img 
                            src={logo} 
                            alt="Logo" 
                            style={{
                                height: '120px',
                                width: 'auto',
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                                animation: 'logoFloat 4s ease-in-out infinite'
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h3"
                        sx={{
                            color: 'white',
                            fontWeight: 300,
                            textAlign: 'center',
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            letterSpacing: '2px',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            animation: 'textGlow 2s ease-in-out infinite alternate',
                            '@keyframes textGlow': {
                                '0%': { textShadow: '0 2px 10px rgba(0,0,0,0.3)' },
                                '100%': { textShadow: '0 5px 20px rgba(255,255,255,0.5)' },
                            },
                        }}
                    >
                        CO-HOPERS
                    </Typography>
                </Box>

                {/* Modern Glass Card */}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 3,
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        p: { xs: 3, sm: 4, md: 5 },
                        maxWidth: { xs: '90%', sm: '480px', md: '520px' },
                        width: { xs: '90%', sm: 'auto' },
                        textAlign: 'center',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        animation: 'cardFloat 6s ease-in-out infinite',
                        '&::before': {
                            content: '""',
                        position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            borderRadius: '24px',
                            zIndex: -1
                        },
                        '@keyframes cardFloat': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                        },
                        '@keyframes logoFloat': {
                            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                            '50%': { transform: 'translateY(-5px) rotate(2deg)' },
                        },
                    }}
                >
                    <Typography 
                        variant="h2" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 600,
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                            letterSpacing: '1px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            animation: 'titleGlow 3s ease-in-out infinite alternate',
                            '@keyframes titleGlow': {
                                '0%': { filter: 'brightness(1)' },
                                '100%': { filter: 'brightness(1.2)' },
                            },
                        }}
                    >
                        Book Meeting Room
                    </Typography>
                    
                    <Box
                        sx={{ 
                            width: '80px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #ffffff 0%, #f0f8ff 100%)',
                            borderRadius: '2px',
                            margin: '0 auto',
                            mb: { xs: 3, sm: 4 },
                            animation: 'dividerPulse 2s ease-in-out infinite',
                            '@keyframes dividerPulse': {
                                '0%, 100%': { opacity: 0.6, transform: 'scaleX(1)' },
                                '50%': { opacity: 1, transform: 'scaleX(1.2)' },
                            },
                        }}
                    />
                    
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: { xs: 4, sm: 5 },
                            fontSize: { xs: '1rem', sm: '1.2rem' },
                            lineHeight: 1.6,
                            fontWeight: 300,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Reserve our premium meeting spaces for productive discussions, presentations, and collaborative sessions.
                    </Typography>
                    
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleBookNowClick}
                        sx={{
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                            color: 'white',
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            fontWeight: 600,
                            padding: { xs: '12px 32px', sm: '16px 40px' },
                            borderRadius: '50px',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            textTransform: 'none',
                            letterSpacing: '1px',
                            boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                transition: 'left 0.5s ease',
                            },
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff5252 0%, #e53935 100%)',
                                transform: 'translateY(-3px) scale(1.05)',
                                boxShadow: '0 15px 40px rgba(255, 107, 107, 0.6)',
                                '&::before': {
                                    left: '100%',
                                }
                            },
                            '&:active': {
                                transform: 'translateY(-1px) scale(1.02)',
                            },
                            animation: 'buttonPulse 4s ease-in-out infinite',
                            '@keyframes buttonPulse': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.02)' },
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            📅
                            <span>Book Now</span>
                        </Box>
                    </Button>
                </Box>
            </Box>

            {/* Modern Booking Type Modal */}
            <Modal 
                open={showBookingModal} 
                onClose={() => setShowBookingModal(false)} 
                closeAfterTransition
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Fade in={showBookingModal}>
                    <Box sx={{
                        position: 'relative',
                        width: { xs: '90%', sm: '420px', md: '480px' },
                        maxHeight: '90vh',
                        overflow: 'auto',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        p: { xs: 3, sm: 4 },
                        animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            borderRadius: '24px',
                            zIndex: -1
                        },
                        '@keyframes modalSlideIn': {
                            '0%': { 
                                opacity: 0, 
                                transform: 'scale(0.8) translateY(20px)' 
                            },
                            '100%': { 
                                opacity: 1, 
                                transform: 'scale(1) translateY(0)' 
                            }
                        },
                        '&::-webkit-scrollbar': {
                            width: '6px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '3px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(102, 126, 234, 0.5)',
                            borderRadius: '3px',
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.7)'
                            }
                        }
                    }}>
                        <IconButton
                            onClick={() => setShowBookingModal(false)}
                            sx={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                color: '#666',
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    color: '#333',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        {/* Modern Header */}
                        <Box sx={{ 
                            textAlign: 'center', 
                            mb: 4,
                            pt: 2
                        }}>
                        <Box
                            sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                justifyContent: 'center',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                mb: 2,
                                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                                    animation: 'iconFloat 3s ease-in-out infinite',
                                    '@keyframes iconFloat': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-8px)' },
                                },
                            }}
                        >
                                <Typography sx={{ fontSize: '2rem' }}>🏢</Typography>
                            </Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    color: '#333',
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: { xs: '1.5rem', sm: '1.8rem' }
                                }}
                            >
                                Room Booking
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#666',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Select your booking preferences
                            </Typography>
                        </Box>

                        <FormControl 
                            fullWidth 
                            sx={{ 
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '16px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'rgba(102, 126, 234, 0.4)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                                    },
                                    '&.Mui-focused': {
                                        borderColor: '#667eea',
                                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                    }
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#667eea',
                                    fontWeight: 500
                                }
                            }}
                        >
                            <InputLabel>Booking Type</InputLabel>
                            <Select
                                value={bookingType}
                                onChange={handleBookingTypeChange}
                                label="Booking Type"
                                disabled={isLoadingBookingTypes}
                                sx={{
                                    '& .MuiSelect-select': {
                                        padding: '16px',
                                        fontSize: '1rem'
                                    }
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                    Select Booking Type
                                    </Typography>
                                </MenuItem>
                                {bookingTypes && bookingTypes.length > 0 ? (
                                    bookingTypes.map((type) => (
                                        <MenuItem 
                                            key={type.id} 
                                            value={type.name}
                                            sx={{
                                                '&:hover': {
                                                    background: 'rgba(102, 126, 234, 0.1)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                }} />
                                            {type.name}
                                            </Box>
                                        </MenuItem>
                                    ))
                                ) : (
                                    <>
                                        <MenuItem value="Hourly">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography sx={{ fontSize: '1.2rem' }}>⏰</Typography>
                                                Hourly
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="Whole Day">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography sx={{ fontSize: '1.2rem' }}>📅</Typography>
                                                Whole Day
                                            </Box>
                                        </MenuItem>
                                    </>
                                )}
                            </Select>
                        </FormControl>

                        {bookingType && (
                            <Box sx={{
                                animation: 'slideDown 0.3s ease-out',
                                '@keyframes slideDown': {
                                    '0%': { opacity: 0, transform: 'translateY(-10px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' }
                                }
                            }}>
                                <FormControl 
                                    fullWidth 
                                    sx={{ 
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            background: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(102, 126, 234, 0.2)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: 'rgba(102, 126, 234, 0.4)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#667eea',
                                                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                                            }
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#667eea',
                                            fontWeight: 500
                                        }
                                    }}
                                >
                                <InputLabel>Member Type</InputLabel>
                                <Select
                                    value={memberType}
                                    onChange={handleMemberTypeChange}
                                    label="Member Type"
                                    disabled={isLoadingMemberTypes}
                                        sx={{
                                            '& .MuiSelect-select': {
                                                padding: '16px',
                                                fontSize: '1rem'
                                            }
                                        }}
                                >
                                    <MenuItem value="" disabled>
                                            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                                        Select Member Type
                                            </Typography>
                                    </MenuItem>
                                    {memberTypes && memberTypes.length > 0 ? (
                                        memberTypes.map((type) => (
                                                <MenuItem 
                                                    key={type.id} 
                                                    value={type.name}
                                                    sx={{
                                                        '&:hover': {
                                                            background: 'rgba(102, 126, 234, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: type.name === 'Member' 
                                                                ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                                                                : 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
                                                        }} />
                                                {type.name}
                                                    </Box>
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <>
                                                <MenuItem value="Member">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography sx={{ fontSize: '1.2rem' }}>👤</Typography>
                                                        Member
                                                    </Box>
                                                </MenuItem>
                                                <MenuItem value="Non-Member">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Typography sx={{ fontSize: '1.2rem' }}>👥</Typography>
                                                        Non-Member
                                                    </Box>
                                                </MenuItem>
                                        </>
                                    )}
                                </Select>
                            </FormControl>
                            </Box>
                        )}

                        {bookingType && memberType && (
                            <Card sx={{
                                    mt: 1.5,
                                    background: 'linear-gradient(135deg, #000000 0%, #00B2B2 100%)',
                                color: 'white',
                                transform: 'scale(1)',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.02)'
                                }
                            }}>
                                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                    <Box sx={{ mb: 1 }}>
                                        <img 
                                            src={logo} 
                                            alt="Logo" 
                                            style={{ 
                                                width: '100px', 
                                                height: 'auto',
                                                marginBottom: '0.5rem',
                                                filter: 'brightness(1.1)'
                                            }} 
                                        />
                                    </Box>
                                    {isLoadingPricing ? (
                                        <Typography variant="h6" gutterBottom>
                                            Loading pricing...
                                        </Typography>
                                    ) : (pricingData || (bookingType === 'Whole Day' && memberType)) ? (
                                        <>
                                            <Typography variant="h6" gutterBottom>
                                                {bookingType === 'Whole Day' 
                                                    ? (selectedSeating 
                                                        ? `₹${selectedSeating === 'C2' 
                                                            ? (memberType === 'Member' ? '2,500' : '3,000') 
                                                            : (memberType === 'Member' ? '1,800' : '2,300')}/- (Including GST)`
                                                        : `Starting from ₹${memberType === 'Member' ? '1,800' : '2,300'}/- (Including GST)`)
                                                    : `₹${pricingData?.price}/- ${bookingType === 'Hourly' ? '+ GST per hour' : '(Including GST)'}`
                                                }
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                {bookingType === 'Whole Day' 
                                                    ? (memberType === 'Member' ? '09:00 to 18:30 (9.5 hours)' : '09:00 to 18:00 (9 hours)')
                                                    : `${pricingData?.openTime} to ${pricingData?.closeTime}`
                                                }
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                {bookingType === 'Whole Day' ? 'Whole Day Booking' : pricingData?.bookingType}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {memberType} {selectedSeating ? `- ${seatingOptions.find(s => s.id === selectedSeating)?.name}` : '- Multiple seating options available'}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="h6" gutterBottom>
                                            Please select {bookingType === 'Whole Day' ? 'all options' : 'seating capacity'} to view pricing
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                console.log('=== Book Now Button Clicked ===');
                                                console.log('Booking Type:', bookingType);
                                                console.log('Member Type:', memberType);
                                                console.log('Selected Date:', selectedDate);
                                                console.log('Selected Seating:', selectedSeating);
                                                console.log('Is Authenticated:', isAuthenticated);
                                                console.log('Pricing Data:', pricingData);
                                                console.log('Button should be disabled:', bookingType === 'Whole Day' ? (!bookingType || !memberType || !selectedDate || !selectedSeating) : !pricingData);
                                                console.log('================================');
                                                
                                                // Check if user is member and not authenticated
                                                if (memberType === 'Member' && !isAuthenticated) {
                                                    console.log('Showing login modal for member authentication');
                                                    setShowLoginModal(true);
                                                } else {
                                                    // Always show time slot modal first for date/seating selection
                                                    console.log('Opening time slot modal for date and seating selection');
                                                    setShowTimeSlotModal(true);
                                                }
                                            }}
                                            disabled={
                                                // For whole day bookings, only require booking type and member type
                                                bookingType === 'Whole Day' 
                                                    ? (!bookingType || !memberType)
                                                    : !pricingData  // For hourly bookings, require pricing data
                                            }
                                            sx={{
                                                bgcolor: 'white',
                                                color: '#000000',
                                                px: 3,
                                                py: 0.5,
                                                fontWeight: 'bold',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.9)'
                                                }
                                            }}
                                        >
                                            Book Now
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Time Slot Selection Modal */}
            <Modal
                open={showTimeSlotModal}
                onClose={() => setShowTimeSlotModal(false)}
                closeAfterTransition
            >
                <Fade in={showTimeSlotModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: 500 },
                        maxHeight: { xs: '90vh', sm: '85vh' },
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        borderRadius: { xs: 2, sm: 3 },
                        boxShadow: 24,
                        p: { xs: 2, sm: 3, md: 4 },
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
                        '&::-webkit-scrollbar': {
                            width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#888',
                            borderRadius: '4px',
                            '&:hover': {
                                background: '#555'
                            }
                        }
                    }}>
                        <IconButton
                            onClick={() => setShowTimeSlotModal(false)}
                            sx={{
                                position: 'absolute',
                                right: { xs: 4, sm: 8 },
                                top: { xs: 4, sm: 8 },
                                color: 'gray'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                                mb: { xs: 2, sm: 3 },
                                fontWeight: 'bold'
                            }}
                        >
                            Select Date and Seating Capacity
                        </Typography>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: { xs: 2, sm: 3 },
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 2, sm: 0 }
                        }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={handleDateSelect}
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            label="Selected Date"
                                            sx={{
                                                '& .MuiInputBase-root': {
                                                    height: { xs: '45px', sm: '50px' },
                                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                                }
                                            }}
                                            InputProps={{
                                                ...params.InputProps,
                                                readOnly: true,
                                                endAdornment: (
                                                    <IconButton 
                                                        onClick={handleCalendarClick}
                                                        sx={{ 
                                                            p: { xs: 0.5, sm: 1 }
                                                        }}
                                                    >
                                                        <CalendarTodayIcon sx={{ 
                                                            fontSize: { xs: '1.2rem', sm: '1.5rem' }
                                                        }} />
                                                    </IconButton>
                                                )
                                            }}
                                        />
                                    )}
                                    PopperProps={{
                                        anchorEl: calendarAnchorEl,
                                        open: Boolean(calendarAnchorEl),
                                        onClose: handleCalendarClose,
                                        sx: {
                                            '& .MuiPaper-root': {
                                                width: { xs: '280px', sm: '320px' }
                                            }
                                        }
                                    }}
                                    components={{
                                        OpenPickerIcon: () => null,
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>

                        {selectedDate && (
                            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 3 } }}>
                                <InputLabel>Seating Capacity</InputLabel>
                                <Select
                                    value={selectedSeating}
                                    onChange={handleSeatingChange}
                                    label="Seating Capacity"
                                    sx={{
                                        height: { xs: '45px', sm: '50px' },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    {seatingOptions.map((option) => (
                                        <MenuItem 
                                            key={option.id} 
                                            value={option.id}
                                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                        >
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Whole Day Booking Summary and Book Now Button */}
                        {bookingType === 'Whole Day' && selectedDate && selectedSeating && (
                            <Card sx={{
                                mt: 3,
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: 3
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                                        🌟 Booking Summary
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            📅 <strong>Date:</strong> {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            ⏰ <strong>Time:</strong> {memberType === 'Member' ? '9:00 AM - 6:30 PM (9.5 hours)' : '9:00 AM - 6:00 PM (9 hours)'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            🪑 <strong>Seating:</strong> {seatingOptions.find(s => s.id === selectedSeating)?.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            👤 <strong>Type:</strong> {memberType}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                        borderRadius: 2,
                                        p: 2,
                                        textAlign: 'center',
                                        mb: 3
                                    }}>
                                        <Typography variant="h5" sx={{
                                            fontWeight: 'bold',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            ₹{selectedSeating === 'C2' 
                                                ? (memberType === 'Member' ? '2,500' : '3,000') 
                                                : (memberType === 'Member' ? '1,800' : '2,300')
                                            }
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            Including GST
                                        </Typography>
                                    </Box>
                                    
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() => {
                                            console.log('Whole Day Book Now clicked - opening summary modal');
                                            setShowTimeSlotModal(false);
                                            setShowWholeDaySummaryModal(true);
                                        }}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            height: '56px',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            borderRadius: '16px',
                                            textTransform: 'none',
                                            letterSpacing: '0.5px',
                                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 15px 30px rgba(102, 126, 234, 0.4)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Book Whole Day
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {bookingType && memberType && bookingType !== 'Whole Day' && (
                            <Box sx={{
                                mt: 4,
                                animation: 'slideUp 0.4s ease-out',
                                '@keyframes slideUp': {
                                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' }
                                }
                            }}>-
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleBookingSubmit}
                                    disabled={!bookingType || !memberType}
                            sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        height: '56px',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '16px',
                                        textTransform: 'none',
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                            transition: 'left 0.5s ease',
                                        },
                                '&:hover': {
                                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
                                            '&::before': {
                                                left: '100%',
                                            }
                                        },
                                        '&:active': {
                                            transform: 'translateY(0px)',
                                },
                                '&:disabled': {
                                            background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                            color: '#999',
                                            boxShadow: 'none',
                                            transform: 'none'
                                }
                            }}
                        >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>Continue</span>
                                        <Typography sx={{ fontSize: '1.2rem' }}>→</Typography>
                                    </Box>
                        </Button>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Modern Room Selection & Time Slots Modal */}
            <Modal
                open={showRoomSelectionModal}
                onClose={() => setShowRoomSelectionModal(false)}
                closeAfterTransition
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Fade in={showRoomSelectionModal}>
                    <Box sx={{
                        position: 'relative',
                        width: { xs: '95%', sm: '90%', md: '85%' },
                        maxWidth: 1000,
                        maxHeight: '90vh',
                        overflow: 'auto',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        p: { xs: 3, sm: 4, md: 5 },
                        animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                            borderRadius: '24px',
                            zIndex: -1
                        },
                        '@keyframes modalSlideIn': {
                            '0%': { 
                                opacity: 0, 
                                transform: 'scale(0.9) translateY(20px)' 
                            },
                            '100%': { 
                                opacity: 1, 
                                transform: 'scale(1) translateY(0)' 
                            }
                        },
                        '&::-webkit-scrollbar': {
                            width: '6px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '3px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(102, 126, 234, 0.5)',
                            borderRadius: '3px',
                            '&:hover': {
                                background: 'rgba(102, 126, 234, 0.7)'
                            }
                        }
                    }}>
                        <IconButton
                            onClick={() => setShowRoomSelectionModal(false)}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: 16,
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                color: '#666',
                                zIndex: 10,
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    color: '#333',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        
                        {/* Modern Header */}
                        <Box sx={{ 
                            textAlign: 'center', 
                            mb: 5,
                            pt: 2
                        }}>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                    mb: 2,
                                    boxShadow: '0 10px 25px rgba(76, 175, 80, 0.3)',
                                    animation: 'iconFloat 3s ease-in-out infinite',
                                    '@keyframes iconFloat': {
                                        '0%, 100%': { transform: 'translateY(0px)' },
                                        '50%': { transform: 'translateY(-8px)' },
                                    },
                                }}
                            >
                                <Typography sx={{ fontSize: '2rem' }}>⏰</Typography>
                            </Box>
                        <Typography 
                                variant="h4" 
                            sx={{
                                    color: '#333',
                                    fontWeight: 600,
                                    mb: 1,
                                    fontSize: { xs: '1.5rem', sm: '1.8rem' }
                            }}
                        >
                            Select Time Slot
                        </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#666',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Choose your preferred date and time
                            </Typography>
                        </Box>

                        {/* Clean International Date Navigation */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 5,
                            p: 3,
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e9ecef',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <Button
                                onClick={goToPreviousDates}
                                variant="outlined"
                                sx={{ 
                                    minWidth: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e9ecef',
                                    color: '#6c757d',
                                    backgroundColor: '#ffffff',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#3498db',
                                        borderColor: '#3498db',
                                        color: 'white',
                                        transform: 'translateX(-2px)'
                                    }
                                }}
                            >
                                ←
                            </Button>
                            
                            <Box sx={{
                                display: 'flex',
                                gap: 1.5,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                {getAvailableDates().map((date) => (
                                    <Button
                                        key={format(date, 'yyyy-MM-dd')}
                                        variant={selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                                            ? "contained" 
                                            : "outlined"
                                        }
                                        onClick={() => {
                                            console.log('Date selected (second location):', {
                                                date: format(date, 'yyyy-MM-dd'),
                                                memberType,
                                                selectedSeating
                                            });
                                            setSelectedDate(date);
                                            // fetchAvailableSlots will be called by useEffect
                                        }}
                                        sx={{
                                            minWidth: '100px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif',
                                            backgroundColor: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                                ? '#3498db'
                                                : '#ffffff',
                                            color: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                                ? 'white'
                                                : '#2c3e50',
                                            border: `1px solid ${selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') ? '#3498db' : '#e9ecef'}`,
                                            boxShadow: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                                ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                                                : 'none',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                                    ? '#2980b9'
                                                    : '#f8f9fa',
                                                borderColor: '#3498db',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography sx={{ 
                                                fontSize: '0.85rem', 
                                                fontWeight: 600,
                                                lineHeight: 1.2
                                            }}>
                                                {format(date, 'dd MMM')}
                                            </Typography>
                                            <Typography sx={{ 
                                                fontSize: '0.7rem', 
                                                opacity: 0.7,
                                                fontWeight: 400
                                            }}>
                                                {format(date, 'yyyy')}
                                            </Typography>
                                        </Box>
                                    </Button>
                                ))}
                            </Box>
                            
                            <Button
                                onClick={goToNextDates}
                                variant="outlined"
                                sx={{ 
                                    minWidth: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e9ecef',
                                    color: '#6c757d',
                                    backgroundColor: '#ffffff',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: '#3498db',
                                        borderColor: '#3498db',
                                        color: 'white',
                                        transform: 'translateX(2px)'
                                    }
                                }}
                            >
                                →
                            </Button>
                        </Box>

                        {isLoadingSlots ? (
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: { xs: 4, sm: 6 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <Box sx={{
                                    width: { xs: 50, sm: 60 },
                                    height: { xs: 50, sm: 60 },
                                    borderRadius: '50%',
                                    background: 'conic-gradient(from 0deg, #4CAF50, #81C784, #4CAF50)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'spin 2s linear infinite',
                                    '@keyframes spin': {
                                        '0%': { transform: 'rotate(0deg)' },
                                        '100%': { transform: 'rotate(360deg)' }
                                    }
                                }}>
                                    <Box sx={{
                                        width: { xs: 38, sm: 45 },
                                        height: { xs: 38, sm: 45 },
                                        borderRadius: '50%',
                                        bgcolor: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                                    }}>
                                        ⏰
                                    </Box>
                                </Box>
                                <Typography variant="h6" sx={{ 
                                    color: '#4CAF50', 
                                    fontWeight: 'bold',
                                    fontSize: { xs: '1rem', sm: '1.25rem' }
                                }}>
                                    Finding Available Slots...
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                    color: '#666', 
                                    maxWidth: '280px',
                                    fontSize: { xs: '0.85rem', sm: '0.9rem' }
                                }}>
                                    We're checking the best time slots for your meeting
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ 
                                width: '100%',
                                maxWidth: '100%',
                                mb: { xs: 4, sm: 5 }
                            }}>
                                {/* Duration Selection Section */}
                                <Box sx={{
                                    mb: 4,
                                    p: 3,
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '16px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        fontSize: '1.1rem',
                                        mb: 2,
                                        fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif'
                                    }}>
                                        Select Duration
                                    </Typography>
                                    
                                    {/* Advertisement for Whole Day Option */}
                                    <Box sx={{
                                        mb: 3,
                                        p: 2.5,
                                        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                        textAlign: 'center'
                                    }}>
                                        <Typography sx={{
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            mb: 1,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                        }}>
                                            💡 Need more than 7 hours?
                                        </Typography>
                                        <Typography sx={{
                                            color: 'rgba(255,255,255,0.95)',
                                            fontSize: '0.8rem',
                                            fontWeight: 400
                                        }}>
                                            Explore our "Whole Day" booking type for extended meetings!
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: 'repeat(3, 1fr)',
                                            sm: 'repeat(4, 1fr)',
                                            md: 'repeat(5, 1fr)'
                                        },
                                        gap: 1.5,
                                        mb: 2
                                    }}>
                                        {getDurationOptions().map((duration) => (
                                            <Button
                                                key={duration.id}
                                                variant={selectedBookingDuration === duration.id ? "contained" : "outlined"}
                                                onClick={() => {
                                                    setSelectedBookingDuration(duration.id);
                                                    setSelectedTimeSlots([]); // Clear previous selections
                                                }}
                                                sx={{
                                                    height: '48px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif',
                                                    backgroundColor: selectedBookingDuration === duration.id
                                                        ? '#3498db'
                                                        : '#ffffff',
                                                    color: selectedBookingDuration === duration.id
                                                        ? 'white'
                                                        : '#2c3e50',
                                                    border: `1px solid ${selectedBookingDuration === duration.id ? '#3498db' : '#e9ecef'}`,
                                                    boxShadow: selectedBookingDuration === duration.id
                                                        ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                                                        : 'none',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: selectedBookingDuration === duration.id
                                                            ? '#2980b9'
                                                            : '#f8f9fa',
                                                        borderColor: '#3498db',
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
                                                    }
                                                }}
                                            >
                                                {duration.label}
                                            </Button>
                                        ))}
                                    </Box>
                                    
                                    {/* Whole Day Option - Separate and Prominent */}
                                    <Box sx={{ mb: 2 }}>
                                        <Button
                                            variant={selectedBookingDuration === 'wholeday' ? "contained" : "outlined"}
                                            onClick={() => {
                                                setSelectedBookingDuration('wholeday');
                                                setSelectedTimeSlots([]); // Clear previous selections
                                            }}
                                            sx={{
                                                width: '100%',
                                                height: '56px',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif',
                                                backgroundColor: selectedBookingDuration === 'wholeday'
                                                    ? '#e74c3c'
                                                    : '#ffffff',
                                                color: selectedBookingDuration === 'wholeday'
                                                    ? 'white'
                                                    : '#e74c3c',
                                                border: `2px solid ${selectedBookingDuration === 'wholeday' ? '#e74c3c' : '#e74c3c'}`,
                                                boxShadow: selectedBookingDuration === 'wholeday'
                                                    ? '0 6px 16px rgba(231, 76, 60, 0.3)'
                                                    : 'none',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: selectedBookingDuration === 'wholeday'
                                                        ? '#c0392b'
                                                        : 'rgba(231, 76, 60, 0.1)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 20px rgba(231, 76, 60, 0.25)'
                                                }
                                            }}
                                        >
                                            🏢 Book Whole Day (7+ hours)
                                        </Button>
                                    </Box>
                                    
                                    {selectedBookingDuration && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(52, 152, 219, 0.2)'
                                        }}>
                                            <Typography variant="body2" sx={{
                                                color: '#3498db',
                                                fontSize: '0.85rem',
                                                fontWeight: 500
                                            }}>
                                                {selectedBookingDuration === 'wholeday' 
                                                    ? '🏢 Click any slot to book the entire day (all available slots)'
                                                    : '💡 Select any time slot below and we\'ll automatically book consecutive slots for your selected duration'
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Time Slots Header */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 3,
                                    pb: 2,
                                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                        fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif'
                                    }}>
                                        Available Time Slots
                                    </Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: '20px',
                                        bgcolor: 'rgba(52, 152, 219, 0.1)',
                                        border: '1px solid rgba(52, 152, 219, 0.2)'
                                    }}>
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: '#3498db'
                                        }} />
                                        <Typography variant="caption" sx={{
                                            color: '#3498db',
                                            fontWeight: 500,
                                            fontSize: '0.75rem'
                                        }}>
                                            {availableSlots.length} slots available
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Typography variant="body2" sx={{ 
                                    color: '#4CAF50', 
                                    mb: 2, 
                                    textAlign: 'center',
                                    fontSize: '0.9rem'
                                }}>
                                    Choose "Manual Selection" to pick individual slots, or select a duration ({memberType === 'Member' ? '30min-7hr' : '1hr-7hr'}) for automatic consecutive booking
                                </Typography>
                                
                                {/* Time Slots Grid - International Layout */}
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: 'repeat(2, 1fr)',
                                        sm: 'repeat(3, 1fr)',
                                        md: 'repeat(4, 1fr)',
                                        lg: 'repeat(6, 1fr)'
                                    },
                                    gap: { xs: 1.5, sm: 2, md: 2 },
                                    width: '100%'
                                }}>
                                {availableSlots.map((slot, index) => {
                                    const isSelected = selectedTimeSlots.some(s => s.start === slot.start && s.end === slot.end);
                                    const isInPreview = hoveredSlot && getConsecutiveSlots(slot, selectedBookingDuration).some(s => 
                                        s.start === slot.start && s.end === slot.end
                                    );
                                    const canSelect = true;
                                    
                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => canSelect && handleTimeSlotSelectionUnified(slot)}
                                            onMouseEnter={() => setHoveredSlot(slot)}
                                            onMouseLeave={() => setHoveredSlot(null)}
                                            sx={{
                                                position: 'relative',
                                                minHeight: { xs: '70px', sm: '80px' },
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: canSelect ? 'pointer' : 'not-allowed',
                                                border: '2px solid transparent',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                backgroundColor: isSelected 
                                                    ? '#3498db'
                                                    : isInPreview 
                                                        ? '#e8f4fd'
                                                        : '#ffffff',
                                                borderColor: isSelected 
                                                    ? '#3498db'
                                                    : isInPreview 
                                                        ? '#3498db'
                                                        : '#e9ecef',
                                                boxShadow: isSelected 
                                                    ? '0 4px 12px rgba(52, 152, 219, 0.3)'
                                                    : isInPreview
                                                        ? '0 2px 8px rgba(52, 152, 219, 0.2)'
                                                        : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                '&:hover': canSelect ? {
                                                    borderColor: '#3498db',
                                                    backgroundColor: isSelected ? '#2980b9' : '#f8fcff',
                                                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.25)',
                                                    transform: 'translateY(-2px)'
                                                } : {},
                                                p: { xs: 1.5, sm: 2 }
                                            }}
                                        >
                                            {/* Time Display */}
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    color: isSelected ? '#ffffff' : '#2c3e50',
                                                    textAlign: 'center',
                                                    lineHeight: 1.2,
                                                    fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif'
                                                }}
                                            >
                                                {slot.display}
                                            </Typography>
                                            
                                            {/* Duration Badge */}
                                            {slot.duration && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        mt: 0.5,
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: '10px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 500,
                                                        backgroundColor: isSelected 
                                                            ? 'rgba(255, 255, 255, 0.2)'
                                                            : 'rgba(52, 152, 219, 0.1)',
                                                        color: isSelected ? '#ffffff' : '#3498db',
                                                        border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(52, 152, 219, 0.2)'}`
                                                    }}
                                                >
                                                    {slot.duration}
                                                </Typography>
                                            )}

                                            {/* Selection Indicator */}
                                            {isSelected && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                >
                                                    <Typography sx={{ 
                                                        color: '#3498db', 
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        ✓
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                                </Box>
                            </Box>
                        )}

                        {selectedTimeSlots.length > 0 && (
                            <Box sx={{ 
                                mt: 4,
                                p: 3,
                                backgroundColor: '#f8f9fa',
                                borderRadius: '16px',
                                border: '1px solid #e9ecef',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    gap: 1.5
                                }}>
                                    <Box sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        backgroundColor: '#3498db',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedTimeSlots.length}
                                    </Box>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif'
                                        }}
                                    >
                                        Selected Time Slots ({selectedTimeSlots.length})
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ 
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    mb: 3
                                }}>
                                    {selectedTimeSlots.map((slot, index) => (
                                        <Box 
                                            key={index}
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                backgroundColor: '#ffffff',
                                                borderRadius: '8px',
                                                border: '1px solid #e1e8ed',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                color: '#2c3e50'
                                            }}
                                        >
                                            <Box sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                backgroundColor: '#3498db'
                                            }} />
                                            {slot.display} ({slot.duration})
                                        </Box>
                                    ))}
                                </Box>
                                
                                <Box sx={{
                                    p: 2.5,
                                    backgroundColor: '#3498db',
                                    borderRadius: '12px',
                                    textAlign: 'center'
                                }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            fontFamily: '"SF Pro Display", "Segoe UI", "Roboto", sans-serif'
                                        }}
                                    >
                                        Total: ₹{Math.ceil(calculatedPrice.total)} (Including GST)
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Add Reason Dropdown for Member Type */}
                        {memberType === 'Member' && selectedTimeSlots.length > 0 && (
                            <FormControl fullWidth sx={{ mt: { xs: 2, sm: 3 } }}>
                                <InputLabel>Select Reason</InputLabel>
                                <Select
                                    value={selectedReason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    label="Select Reason"
                                    sx={{
                                        height: { xs: '45px', sm: '50px' },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        Select a reason
                                    </MenuItem>
                                    {meetingReasons.map((reason) => (
                                        <MenuItem 
                                            key={reason.id} 
                                            value={reason.id}
                                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                        >
                                            {reason.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Update the button text based on member type */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: { xs: 2, sm: 3 },
                            gap: { xs: 1, sm: 2 }
                        }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setShowRoomSelectionModal(false);
                                    setShowTimeSlotModal(true);
                                }}
                                sx={{
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    height: { xs: '40px', sm: '45px' }
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleFinalBooking}
                                disabled={!selectedDate || selectedTimeSlots.length === 0 || (memberType === 'Member' && !selectedReason)}
                                sx={{
                                    background: 'linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #6A5ACD 0%, #5B4ACE 100%)'
                                    },
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    height: { xs: '40px', sm: '45px' }
                                }}
                            >
                                {memberType === 'Member' ? 'Book Now 5555' : 'Proceed to Payment'}
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* Add the Confirmation Modal */}
            <ConfirmationModal />

            {/* Payment Modal */}
            <PaymentModal />
            
            {/* Summary Modal */}
            <SummaryModal />
            
            {/* Pending Modal */}
            <PendingModal />
            
            {/* Login Modal for Members */}
            <LoginModal
                open={showLoginModal}
                onClose={handleLoginClose}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* Whole Day Booking Summary Modal */}
            <Modal
                open={showWholeDaySummaryModal}
                onClose={() => setShowWholeDaySummaryModal(false)}
                closeAfterTransition
            >
                <Fade in={showWholeDaySummaryModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: 600 },
                        maxHeight: { xs: '90vh', sm: '85vh' },
                        overflow: 'auto',
                        bgcolor: 'transparent',
                        borderRadius: 4,
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        p: 0,
                        '&::-webkit-scrollbar': {
                            width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'rgba(0,0,0,0.1)',
                            borderRadius: '10px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '10px'
                        }
                    }}>
                        <Card sx={{
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                            }
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                {/* Header with Close Button */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    mb: 3 
                                }}>
                                    <Typography variant="h5" sx={{
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: { xs: '1.5rem', md: '1.75rem' }
                                    }}>
                                        🌟 Whole Day Booking Summary
                                    </Typography>
                                    <IconButton
                                        onClick={() => setShowWholeDaySummaryModal(false)}
                                        sx={{
                                            color: '#666',
                                            '&:hover': {
                                                bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                color: '#667eea'
                                            }
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>

                                {/* Booking Details Card */}
                                <Card sx={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: 3,
                                    mb: 3
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2
                                            }}>
                                                <CalendarTodayIcon sx={{ color: 'white', fontSize: 24 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                    {selectedDate ? format(selectedDate, "EEEE, MMMM dd, yyyy") : 'Date not selected'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    Full Day Conference Experience
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Time Duration Display */}
                                        <Box sx={{
                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                            borderRadius: 2,
                                            p: 3,
                                            mb: 3,
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
                                        }}>
                                            <Typography variant="h4" sx={{
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                mb: 1
                                            }}>
                                                {memberType === 'Member' ? '9:00 AM - 6:30 PM' : '9:00 AM - 6:00 PM'}
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                textAlign: 'center',
                                                color: '#666',
                                                fontWeight: '500'
                                            }}>
                                                {memberType === 'Member' ? '9.5 Hours Premium Access' : '9 Hours Standard Access'}
                                            </Typography>
                                        </Box>

                                        {/* Seating & Member Type Info */}
                                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                            <Box sx={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.8)',
                                                borderRadius: 2,
                                                p: 2,
                                                textAlign: 'center',
                                                border: '1px solid rgba(102, 126, 234, 0.2)'
                                            }}>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                                    Seating Capacity
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                    {seatingOptions.find(s => s.id === selectedSeating)?.name || 'Not selected'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.8)',
                                                borderRadius: 2,
                                                p: 2,
                                                textAlign: 'center',
                                                border: '1px solid rgba(102, 126, 234, 0.2)'
                                            }}>
                                                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                                    Member Type
                                                </Typography>
                                                <Typography variant="h6" sx={{ 
                                                    fontWeight: 'bold', 
                                                    color: memberType === 'Member' ? '#667eea' : '#764ba2'
                                                }}>
                                                    {memberType}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Price Display */}
                                        <Box sx={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                            borderRadius: 3,
                                            p: 3,
                                            textAlign: 'center',
                                            border: '2px solid rgba(102, 126, 234, 0.3)'
                                        }}>
                                            <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                                                Total Price (Including GST)
                                            </Typography>
                                            <Typography variant="h3" sx={{
                                                fontWeight: 'bold',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}>
                                                ₹{pricingData ? Math.ceil(pricingData.total) : (selectedSeating === 'C2' ? (memberType === 'Member' ? '2,500' : '3,000') : (memberType === 'Member' ? '1,800' : '2,300'))}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                                                {memberType === 'Member' ? 'Premium Member Rate' : 'Standard Rate'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowWholeDaySummaryModal(false)}
                                        sx={{
                                            borderColor: '#667eea',
                                            color: '#667eea',
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            '&:hover': {
                                                borderColor: '#764ba2',
                                                color: '#764ba2',
                                                background: 'rgba(102, 126, 234, 0.1)'
                                            }
                                        }}
                                    >
                                        Modify Booking
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            if (memberType === 'Non-Member') {
                                                // For non-members, open payment modal with KYC
                                                setShowWholeDaySummaryModal(false);
                                                setShowPaymentModal(true);
                                            } else {
                                                // For members, handle member booking logic
                                                setShowWholeDaySummaryModal(false);
                                                setShowTimeSlotModal(true);
                                            }
                                        }}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {memberType === 'Member' ? 'Confirm Booking' : 'Proceed to Payment'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
};

export default BookMeetingRoom;

    