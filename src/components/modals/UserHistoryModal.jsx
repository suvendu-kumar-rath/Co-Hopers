import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import userService from '../../services/userService';

const UserHistoryModal = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [historyData, setHistoryData] = useState({
        meetingRoomBookings: [],
        spaceBookings: [],
        payments: []
    });
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!open) {
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await userService.getUserHistory({ page: 1, limit: 10 });
                if (response.success) {
                    setHistoryData(response.data?.data || {
                        meetingRoomBookings: [],
                        spaceBookings: [],
                        payments: []
                    });
                    setPagination(response.data?.pagination || null);
                    setSummary(response.data?.summary || null);
                } else {
                    setError(response.message || 'Failed to load history');
                }
            } catch (err) {
                console.error('History fetch error:', err);
                setError('An unexpected error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [open]);

    const renderMeetingRoomBooking = (booking) => (
        <Card key={`meeting-${booking.id}`} sx={{ mb: 2, boxShadow: 1 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {booking.meetingRoom?.name || 'Meeting Room'}
                    </Typography>
                    <Chip label={booking.status || 'unknown'} size="small" color="success" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Date: {booking.bookingDate || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Time: {(booking.timeSlots || []).join(', ') || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Duration: {booking.duration || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Amount: {booking.totalAmount || 'N/A'}
                </Typography>
            </CardContent>
        </Card>
    );

    const renderSpaceBooking = (booking) => (
        <Card key={`space-${booking.id}`} sx={{ mb: 2, boxShadow: 1 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {booking.space?.spaceName || 'Space Booking'}
                    </Typography>
                    <Chip label={booking.status || 'unknown'} size="small" color="success" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Start: {booking.startDate || booking.date || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    End: {booking.endDate || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Amount: {booking.amount || 'N/A'}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Booking History
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && (
                    <>
                        {summary && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                <Chip label={`Meeting Rooms: ${summary.totalMeetingRoomBookings || 0}`} />
                                <Chip label={`Spaces: ${summary.totalSpaceBookings || 0}`} />
                                <Chip label={`Payments: ${summary.totalPayments || 0}`} />
                            </Box>
                        )}

                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Meeting Room Bookings
                        </Typography>
                        {historyData.meetingRoomBookings?.length
                            ? historyData.meetingRoomBookings.map(renderMeetingRoomBooking)
                            : (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    No meeting room bookings found.
                                </Typography>
                            )}

                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Space Bookings
                        </Typography>
                        {historyData.spaceBookings?.length
                            ? historyData.spaceBookings.map(renderSpaceBooking)
                            : (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    No space bookings found.
                                </Typography>
                            )}

                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Payments
                        </Typography>
                        {historyData.payments?.length ? (
                            historyData.payments.map((payment) => (
                                <Card key={`payment-${payment.id}`} sx={{ mb: 2, boxShadow: 1 }}>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Amount: {payment.amount || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Status: {payment.status || 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No payments found.
                            </Typography>
                        )}

                        {pagination && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                Page {pagination.page || 1} of {pagination.pages || 1}
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UserHistoryModal;
