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

const BookMeetingRoom = () => {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [showRoomSelectionModal, setShowRoomSelectionModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingType, setBookingType] = useState('');
    const [memberType, setMemberType] = useState('');
    
    const [selectedSeating, setSelectedSeating] = useState('');
    const [showTimeSlotGridModal, setShowTimeSlotGridModal] = useState(false);
    
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

    // Update time slot selection handler for multiple slots with limits based on member type
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
    
    // Get maximum allowed time slots based on member type
    const getMaxAllowedSlots = () => {
        return memberType === 'member' ? 3 : 4; // Max 3 slots for members, 4 for non-members
    };
    
    // Get remaining available slots
    const getRemainingSlots = () => {
        const maxSlots = getMaxAllowedSlots();
        return maxSlots - selectedTimeSlots.length;
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
    // Add a new state to track the date window start
    const [dateWindowStart, setDateWindowStart] = useState(new Date());

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
                            setSelectedDate(date);
                            fetchAvailableSlots(date);
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
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Loading available slots...</Typography>
                </Box>
            ) : (
                <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    mb: 3,
                    px: 4
                }}>
                    {availableSlots.map((slot, index) => {
                        const isSelected = selectedTimeSlots.some(s => s.start === slot.start && s.end === slot.end);
                        
                        return (
                            <Box
                                key={index}
                                onClick={() => handleTimeSlotSelection(slot)}
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isSelected ? '2px solid #4CAF50' : '1px solid #4CAF50',
                                    borderRadius: '8px',
                                    cursor: isSelected || selectedTimeSlots.length < getMaxAllowedSlots() ? 'pointer' : 'not-allowed',
                                    bgcolor: isSelected 
                                        ? 'rgba(76, 175, 80, 0.2)'
                                        : selectedTimeSlots.length >= getMaxAllowedSlots() && !isSelected
                                            ? 'rgba(255, 152, 0, 0.1)'
                                            : 'rgba(76, 175, 80, 0.05)',
                                    '&:hover': isSelected || selectedTimeSlots.length < getMaxAllowedSlots() ? {
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                        transform: 'scale(1.05)',
                                    } : {},
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'medium',
                                        color: '#4CAF50',
                                        textAlign: 'center'
                                    }}
                                >
                                    {slot.display}
                                </Typography>
                                {isSelected && (
                                    <Typography
                                        sx={{
                                            fontSize: '0.75rem',
                                            color: '#4CAF50',
                                            mt: 1
                                        }}
                                    >
                                        Selected
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {selectedTimeSlots.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5ff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Selected Time Slots: ({selectedTimeSlots.length}/{getMaxAllowedSlots()})
                    </Typography>
                    {selectedTimeSlots.map((slot, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            {slot.display} ({slot.duration})
                        </Typography>
                    ))}
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                        Total Price: ₹{Math.ceil(calculatedPrice.total)}/- (Including GST)
                    </Typography>
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
                        if (selectedTimeSlots.length > 2) {
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
                        console.log('API Endpoint:', 'https://api.boldtribe.in/api/meeting-rooms/book');
                        console.log('Request Headers:', {
                            // 'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        });
                        console.log('Request Body:', bookingData);

                        // Make the API call
                        console.log('Making API call...');
                        const response = await axios.post(
                            'https://api.boldtribe.in/api/meeting-rooms/book',
                            bookingData,
                            {
                                headers: {
                                    // 'Authorization': `Bearer ${token}`,
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
                    
                    if (bookingType === 'whole_day') {
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
        if (bookingType === 'whole_day') {
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
            const response = await axios.get('https://api.boldtribe.in/api/meeting-rooms/room-types');
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
            if (bookingType === 'whole_day') {
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

    const handleBookingTypeChange = (e) => {
        const newBookingType = e.target.value;
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
                const response = await axios.get('https://api.boldtribe.in/api/meeting-rooms/booking-types');
                console.log('API Response:', response.data);
                
                if (response.data.success) {
                    console.log('Successfully fetched booking types:', response.data.data);
                    setBookingTypes(response.data.data);
                } else {
                    console.error('Failed to fetch booking types. API returned:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching booking types:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
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
                const response = await axios.get('https://api.boldtribe.in/api/meeting-rooms/member-types');
                console.log('Member Types API Response:', response.data);
                
                if (response.data.success) {
                    console.log('Successfully fetched member types:', response.data.data);
                    setMemberTypes(response.data.data);
                } else {
                    console.error('Failed to fetch member types. API returned:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching member types:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
            } finally {
                setIsLoadingMemberTypes(false);
                console.log('Finished loading member types');
            }
        };

        fetchMemberTypes();
    }, []);

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
            const response = await axios.get('https://api.boldtribe.in/api/meeting-rooms/pricing', { params });
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
        
        // Reset date and seating when member type changes
        setSelectedDate(null);
        setSelectedSeating('');
        setSelectedTimeSlots([]);
        setAvailableTimeSlots([]);

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
        setIsLoadingSlots(true);
        console.log('Fetching available slots...');
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await axios.get(`https://api.boldtribe.in/api/meeting-rooms/available-slots`, {
                params: {
                    date: formattedDate,
                    capacityType: selectedSeating === 'C1' ? '4-6 Seater' : '10-12 Seater',
                    bookingType: bookingType === 'hourly' ? 'Hourly' : 'Whole Day',
                    memberType: memberType === 'member' ? 'Member' : 'Non-Member'
                }
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
                        duration: response.data.data.duration,
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

    const navigate = useNavigate();

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
            console.log('API Endpoint:', 'https://api.boldtribe.in/api/meeting-rooms/book');
            console.log('Request Headers:', {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            });
            console.log('Request Body:', bookingData);
            console.log('===========================');

            // Make the API call with auth token
            const response = await axios.post(
                'https://api.boldtribe.in/api/meeting-rooms/book',
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
            onClose={() => setShowPaymentModal(false)}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" component="h2">
                            Select Payment Method
                        </Typography>
                        <IconButton onClick={() => setShowPaymentModal(false)} size="small">
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
                            Selected Time Slots: ({selectedTimeSlots.length}/4)
                        </Typography>
                        {selectedTimeSlots.map((slot, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: { xs: 1, sm: 2 } }}>
                                {slot.start} - {slot.end} (30 Minutes)
                            </Typography>
                        ))}
                    </Box>
                    
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
                            onClick={() => setShowPaymentModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={() => {
                                console.log('=== Payment Details Selected ===');
                                console.log('Room ID:', selectedRoom);
                                console.log('Selected Time Slots:', selectedTimeSlots.length);
                                selectedTimeSlots.forEach((slot, index) => {
                                    console.log(`Slot ${index + 1}: ${slot.start} - ${slot.end} (30 Minutes)`);
                                });
                                console.log('Selected Payment Method:', paymentMethod);
                                console.log('Total Amount (Including GST):', calculatedPrice.total);
                                console.log('============================');
                                
                                setPaymentAmount(calculatedPrice.total);
                                setShowPaymentModal(false);
                                setShowSummaryModal(true);
                            }}
                        >
                            Proceed to Pay
                        </Button>
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
                    mb: { xs: 1, sm: 2 },
                    pb: { xs: 0.5, sm: 1 },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: { xs: -50, sm: -100 },
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${bookMeetingRoomImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'top',
                        filter: 'brightness(0.7)',
                        animation: 'zoomInOut 20s infinite alternate',
                        zIndex: -1
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '200px', sm: '250px', md: '300px' },
                        height: { xs: '200px', sm: '250px', md: '300px' },
                        backgroundImage: `url(${logo})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.3,
                        animation: 'zoomInOut 20s infinite alternate',
                        zIndex: 1
                    },
                    '@keyframes zoomInOut': {
                        '0%': { transform: 'scale(1)' },
                        '100%': { transform: 'scale(1.1)' },
                    },
                }}
            >
                <Box
                    sx={{
                        mb: { xs: 2, sm: 3, md: 4 },
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        marginTop: { xs: '2px', sm: '5px' },
                        '& img': {
                            width: { xs: '100px', sm: '120px', md: '150px' },
                            height: 'auto',
                            animation: 'zoomInOut 20s infinite alternate',
                        },
                        '@keyframes zoomInOut': {
                            '0%': { transform: 'scale(1)' },
                            '100%': { transform: 'scale(1.1)' },
                        },
                    }}
                >
                    <img style={{
                        height: { xs: "100px", sm: "120px", md: "150px" },
                        width: { xs: "100px", sm: "120px", md: "150px" },
                        marginBottom: { xs: "-30px", sm: "-45px", md: "-60px" }
                    }} src={logo} alt="Logo" />
                </Box>

                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        maxWidth: { xs: '90%', sm: 400 },
                        width: { xs: '90%', sm: 'auto' },
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,255,0.9) 100%)',
                        borderRadius: 2,
                        animation: 'fadeIn 1s ease-out',
                        '@keyframes fadeIn': {
                            from: { opacity: 0, transform: 'translateY(20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        },
                        position: 'absolute',
                        top: { xs: '70%', sm: '75%' },
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        marginTop: { xs: '1rem', sm: '2rem' },
                        zIndex: 2
                    }}
                >
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        gutterBottom
                        sx={{ 
                            color: '#7B68EE',
                            fontWeight: 'bold',
                            mb: { xs: 2, sm: 3 },
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
                        }}
                    >
                        Book Meeting Room
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: { xs: 3, sm: 4 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Book our professional meeting room for your important discussions and presentations.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleBookNowClick}
                        sx={{
                            bgcolor: '#7B68EE',
                            '&:hover': { bgcolor: '#6A5ACD' },
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.05)' },
                                '100%': { transform: 'scale(1)' },
                            },
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            padding: { xs: '8px 16px', sm: '10px 24px' }
                        }}
                    >
                        Book Now
                    </Button>
                </Paper>
            </Box>

            {/* Booking Type Modal */}
            <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} closeAfterTransition>
                <Fade in={showBookingModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: 360 },
                        maxHeight: { xs: '90vh', sm: 'auto' },
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: { xs: 2, sm: 3 },
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)',
                    }}>
                        <IconButton
                            onClick={() => setShowBookingModal(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: 'gray'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            sx={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                                '& img': {
                                    width: '150px',
                                    height: 'auto',
                                    animation: 'zoomInOut 20s infinite alternate',
                                },
                                '@keyframes zoomInOut': {
                                    '0%': { transform: 'scale(1)' },
                                    '100%': { transform: 'scale(1.1)' },
                                },
                            }}
                        >
                            <img src={logo} alt="Logo" />
                        </Box>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Booking Type</InputLabel>
                            <Select
                                value={bookingType}
                                onChange={handleBookingTypeChange}
                                label="Booking Type"
                                disabled={isLoadingBookingTypes}
                            >
                                <MenuItem value="" disabled>
                                    Select Booking Type
                                </MenuItem>
                                {bookingTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.name}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {bookingType && (
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Member Type</InputLabel>
                                <Select
                                    value={memberType}
                                    onChange={handleMemberTypeChange}
                                    label="Member Type"
                                    disabled={isLoadingMemberTypes}
                                >
                                    <MenuItem value="" disabled>
                                        Select Member Type
                                    </MenuItem>
                                    {memberTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.name}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                    ) : pricingData ? (
                                        <>
                                            <Typography variant="h6" gutterBottom>
                                                ₹{pricingData.price}/- {bookingType === 'Hourly' ? '+ GST per hour' : '(Including GST)'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                {pricingData.openTime} to {pricingData.closeTime}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                {pricingData.bookingType}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {pricingData.memberType}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="h6" gutterBottom>
                                            Please select seating capacity to view pricing
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => setShowTimeSlotModal(true)}
                                            disabled={!pricingData}
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

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleBookingSubmit}
                            disabled={!selectedDate || !selectedSeating}
                            sx={{
                                background: 'linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%)',
                                height: { xs: '40px', sm: '45px' },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #6A5ACD 0%, #5B4ACE 100%)'
                                },
                                '&:disabled': {
                                    background: '#ccc'
                                }
                            }}
                        >
                            Next
                        </Button>
                    </Box>
                </Fade>
            </Modal>

            {/* Time Slots Modal */}
            <Modal
                open={showRoomSelectionModal}
                onClose={() => setShowRoomSelectionModal(false)}
                closeAfterTransition
            >
                <Fade in={showRoomSelectionModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '95%', sm: '90%', md: '80%' },
                        maxWidth: 900,
                        maxHeight: '90vh',
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
                            onClick={() => setShowRoomSelectionModal(false)}
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
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            Select Time Slot
                        </Typography>

                        {/* Date Selection Tabs with Navigation */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 2 }, 
                            mb: { xs: 3, sm: 4 },
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Button
                                onClick={goToPreviousDates}
                                variant="outlined"
                                sx={{ 
                                    minWidth: { xs: '35px', sm: '40px' }, 
                                    borderRadius: '50%',
                                    p: { xs: 0.5, sm: 1 }
                                }}
                            >
                                &lt;
                            </Button>
                            
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 1, sm: 2 }
                            }}>
                                {getAvailableDates().map((date) => (
                                    <Button
                                        key={format(date, 'yyyy-MM-dd')}
                                        variant={selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                                            ? "contained" 
                                            : "outlined"
                                        }
                                        onClick={() => {
                                            setSelectedDate(date);
                                            fetchAvailableSlots(date);
                                        }}
                                        sx={{
                                            minWidth: { xs: '100%', sm: '120px' },
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            background: selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                                ? 'linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%)'
                                                : 'transparent'
                                        }}
                                    >
                                        {format(date, 'dd MMM yyyy')}
                                    </Button>
                                ))}
                            </Box>
                            
                            <Button
                                onClick={goToNextDates}
                                variant="outlined"
                                sx={{ 
                                    minWidth: { xs: '35px', sm: '40px' }, 
                                    borderRadius: '50%',
                                    p: { xs: 0.5, sm: 1 }
                                }}
                            >
                                &gt;
                            </Button>
                        </Box>

                        {isLoadingSlots ? (
                            <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                                <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                    Loading available slots...
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    sm: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    md: 'repeat(auto-fill, minmax(200px, 1fr))'
                                },
                                gap: { xs: 1, sm: 2 },
                                mb: { xs: 2, sm: 3 },
                                px: { xs: 2, sm: 4 }
                            }}>
                                {availableSlots.map((slot, index) => {
                                    const isSelected = selectedTimeSlots.some(s => s.start === slot.start && s.end === slot.end);
                                    
                                    return (
                                        <Box
                                            key={index}
                                            onClick={() => handleTimeSlotSelection(slot)}
                                            sx={{
                                                width: '100%',
                                                aspectRatio: '1',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: isSelected ? '2px solid #4CAF50' : '1px solid #4CAF50',
                                                borderRadius: { xs: '6px', sm: '8px' },
                                                cursor: isSelected || selectedTimeSlots.length < getMaxAllowedSlots() ? 'pointer' : 'not-allowed',
                                                bgcolor: isSelected 
                                                    ? 'rgba(76, 175, 80, 0.2)'
                                                    : selectedTimeSlots.length >= getMaxAllowedSlots() && !isSelected
                                                        ? 'rgba(255, 152, 0, 0.1)'
                                                        : 'rgba(76, 175, 80, 0.05)',
                                                '&:hover': isSelected || selectedTimeSlots.length < getMaxAllowedSlots() ? {
                                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                                    transform: 'scale(1.05)',
                                                } : {},
                                                transition: 'all 0.2s ease',
                                                p: { xs: 1, sm: 2 }
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                                    fontWeight: 'medium',
                                                    color: '#4CAF50',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {slot.display}
                                            </Typography>
                                            {isSelected && (
                                                <Typography
                                                    sx={{
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                        color: '#4CAF50',
                                                        mt: { xs: 0.5, sm: 1 }
                                                    }}
                                                >
                                                    Selected
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {selectedTimeSlots.length > 0 && (
                            <Box sx={{ 
                                mt: { xs: 2, sm: 3 }, 
                                p: { xs: 1.5, sm: 2 }, 
                                bgcolor: '#f5f5ff', 
                                borderRadius: { xs: 1, sm: 2 }, 
                                border: '1px solid #e0e0e0' 
                            }}>
                                <Typography 
                                    variant="subtitle2" 
                                    gutterBottom
                                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                >
                                    Selected Time Slots: ({selectedTimeSlots.length}/{getMaxAllowedSlots()})
                                </Typography>
                                {selectedTimeSlots.map((slot, index) => (
                                    <Typography 
                                        key={index} 
                                        variant="body2" 
                                        sx={{ 
                                            mb: 0.5,
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                        }}
                                    >
                                        {slot.display} ({slot.duration})
                                    </Typography>
                                ))}
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        mt: { xs: 1.5, sm: 2 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                    }}
                                >
                                    Total Price: ₹{Math.ceil(calculatedPrice.total)}/- (Including GST)
                                </Typography>
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
                                {memberType === 'Member' ? 'Book Now' : 'Proceed to Payment'}
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
        </>
    );
};

export default BookMeetingRoom;
    