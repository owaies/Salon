document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    console.log('Current path:', path);

    if (path.includes('login.html')) {
        handleAuth();
    } else {
        loadPanel();
    }
});

async function handleAuth() {
    const form = document.getElementById('auth-form');
    if (!form) {
        console.error('Auth form not found');
        return;
    }
    const toggleButton = document.getElementById('toggle-form');
    const formTitle = document.getElementById('form-title');
    const errorMessage = document.getElementById('error-message');
    if (!toggleButton || !formTitle || !errorMessage) {
        console.error('Auth form elements missing');
        return;
    }
    let isLogin = true;

    toggleButton.addEventListener('click', () => {
        isLogin = !isLogin;
        formTitle.textContent = isLogin ? 'Login' : 'Register';
        toggleButton.textContent = isLogin ? 'Register' : 'Login';
        form.reset();
        errorMessage.style.display = 'none';
        const nameField = document.getElementById('name');
        if (nameField) {
            nameField.style.display = isLogin ? 'none' : 'block';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        if (!email || !password) {
            errorMessage.textContent = 'Email and password are required';
            errorMessage.style.display = 'block';
            return;
        }
        const url = isLogin ? '/api/login' : '/api/register';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/home.html';
            } else {
                const error = await response.text();
                errorMessage.textContent = error || 'Failed to process request';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Auth error:', error);
            errorMessage.textContent = 'Network error, please try again';
            errorMessage.style.display = 'block';
        }
    });
}

async function loadPanel() {
    const logoutButton = document.getElementById('logout');
    if (!logoutButton) {
        console.error('Logout button not found');
        return;
    }

    logoutButton.style.display = 'block';
    logoutButton.addEventListener('click', async () => {
        try {
            await fetch('/api/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        if (!response.ok) {
            console.warn('Not authenticated, redirecting to login');
            window.location.href = '/login.html';
            return;
        }

        const { role } = await response.json();
        console.log('User role:', role);

        const staffLink = document.getElementById('staff-panel-link');
        const adminLink = document.getElementById('admin-panel-link');
        if (staffLink && role === 'staff') staffLink.style.display = 'inline';
        if (adminLink && role === 'admin') adminLink.style.display = 'inline';

        const path = window.location.pathname;
        if (path.includes('home.html')) {
            renderHomePage();
        } else if (path.includes('services.html')) {
            renderServicesPage();
        } else if (path.includes('bookings.html')) {
            renderBookingsPage();
        } else if (path.includes('adminStaff.html')) {
            if (role === 'staff') {
                renderStaffPanel();
            } else if (role === 'admin') {
                renderAdminPanel();
            } else {
                console.error('Unauthorized access to admin/staff panel');
                window.location.href = '/home.html';
            }
        } else if (path.includes('contact.html')) {
            renderContactPage();
        } else {
            console.error('Unknown page:', path);
            window.location.href = '/home.html';
        }
    } catch (error) {
        console.error('Check-auth error:', error);
        window.location.href = '/login.html';
    }
}

function renderHomePage() {
    console.log('Rendering home page');
    if (typeof loadFacilities === 'function') {
        loadFacilities();
    } else {
        console.error('loadFacilities is not defined');
        const facilitiesElement = document.getElementById('facilities');
        if (facilitiesElement) {
            facilitiesElement.innerHTML = '<p>Facility module not loaded</p>';
        }
    }
}

function renderServicesPage() {
    console.log('Rendering services page');
    loadServices();
    updateTotalPrice();
    handleBooking();
}

function renderBookingsPage() {
    console.log('Rendering bookings page');
    loadUserAppointments();
}

function renderStaffPanel() {
    console.log('Rendering staff panel');
    const staffPanel = document.getElementById('staff-panel');
    if (staffPanel) {
        staffPanel.style.display = 'block';
        loadUsers();
        loadAllAppointments();
        loadStatistics();
        handleSchedule();
    } else {
        console.error('Staff panel not found');
    }
}

function renderAdminPanel() {
    console.log('Rendering admin panel');
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        const serviceForm = document.getElementById('admin-service-form');
        const facilityForm = document.getElementById('admin-facility-form');
        if (serviceForm) serviceForm.style.display = 'block';
        if (facilityForm) facilityForm.style.display = 'block';
        loadUsers('admin-users');
        loadStaff();
        loadServices(true);
        loadAllAppointments('admin-appointments');
        loadStatistics('admin-statistics');
        if (typeof loadFacilities === 'function') {
            loadFacilities(true);
        } else {
            console.error('loadFacilities is not defined');
            const facilitiesElement = document.getElementById('facilities');
            if (facilitiesElement) {
                facilitiesElement.innerHTML = '<p>Facility module not loaded</p>';
            }
        }
        handleServiceManagement();
        handleServiceEdit();
        if (typeof handleFacilityManagement === 'function') {
            handleFacilityManagement();
            handleFacilityEdit();
        } else {
            console.error('handleFacilityManagement is not defined');
        }
        handleSchedule();
    } else {
        console.error('Admin panel not found');
    }
}

function renderContactPage() {
    console.log('Rendering contact page');
}

async function loadServices(forAdmin = false) {
    const servicesDiv = document.getElementById('services');
    if (!servicesDiv) {
        console.error('Services div not found');
        return;
    }
    servicesDiv.innerHTML = '<div class="loading">Loading services...</div>';
    try {
        const response = await fetch('/api/services', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch services: ${response.status}`);
            servicesDiv.innerHTML = `<p>Failed to load services (Status: ${response.status}).</p>`;
            return;
        }
        const services = await response.json();
        servicesDiv.innerHTML = services.length ? services.map(service => `
            <div class="service-card">
                <img src="${service.image || 'https://via.placeholder.com/150'}" alt="${service.name || 'Service'}">
                <h3>${escapeHtml(service.name || 'Unnamed Service')}</h3>
                <p>${escapeHtml(service.description || 'No description')}</p>
                <p>$${parseFloat(service.price || 0).toFixed(2)}</p>
                ${!forAdmin ? `<label><input type="checkbox" class="service-checkbox" value="${service.id}" data-price="${service.price || 0}" onchange="updateTotalPrice()">Select</label>` : ''}
                ${forAdmin ? `
                    <button onclick="editService(${service.id}, '${escapeQuotes(service.name || '')}', '${encodeURIComponent(service.description || '')}', ${service.price || 0}, '${encodeURIComponent(service.image || '')}')">Edit</button>
                    <button onclick="deleteService(${service.id})">Delete</button>
                ` : ''}
            </div>
        `).join('') : '<p>No services available.</p>';
    } catch (error) {
        console.error('Error loading services:', error);
        servicesDiv.innerHTML = '<p>Failed to load services.</p>';
    }
}

function updateTotalPrice() {
    const checkboxes = document.querySelectorAll('.service-checkbox:checked');
    const totalPrice = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.price || 0), 0);
    const totalPriceElement = document.getElementById('total-price');
    const bookingSection = document.getElementById('booking-section');
    if (totalPriceElement) {
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }
    if (bookingSection) {
        bookingSection.style.display = checkboxes.length > 0 ? 'block' : 'none';
    }
}

async function loadUserAppointments() {
    const appointmentsDiv = document.getElementById('appointments');
    if (!appointmentsDiv) {
        console.error('Appointments div not found');
        return;
    }
    appointmentsDiv.innerHTML = '<div class="loading">Loading appointments...</div>';
    try {
        const response = await fetch('/api/appointments/user', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch appointments: ${response.status}`);
            appointmentsDiv.innerHTML = `<p>Failed to load appointments (Status: ${response.status}).</p>`;
            return;
        }
        const appointments = await response.json();
        appointmentsDiv.innerHTML = appointments.length ? appointments.map(appointment => `
            <div class="appointment">
                <p>Service: ${escapeHtml(appointment.service_name || 'Unknown')}</p>
                <p>Date: ${escapeHtml(appointment.date || 'N/A')}</p>
                <p>Time: ${escapeHtml(appointment.time || 'N/A')}</p>
                <p>Status: ${escapeHtml(appointment.status || 'Unknown')}</p>
                <button onclick="editAppointment(${appointment.id})">Edit</button>
                <button onclick="cancelAppointment(${appointment.id})">Cancel</button>
            </div>
        `).join('') : '<p>No appointments available.</p>';
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsDiv.innerHTML = '<p>Failed to load appointments.</p>';
    }
}

async function loadAllAppointments(containerId = 'staff-appointments') {
    const appointmentsDiv = document.getElementById(containerId);
    if (!appointmentsDiv) {
        console.error(`Appointments container ${containerId} not found`);
        return;
    }
    appointmentsDiv.innerHTML = '<div class="loading">Loading appointments...</div>';
    try {
        const response = await fetch('/api/appointments', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch appointments: ${response.status}`);
            appointmentsDiv.innerHTML = `<p>Failed to load appointments (Status: ${response.status}).</p>`;
            return;
        }
        const appointments = await response.json();
        appointmentsDiv.innerHTML = appointments.length ? appointments.map(appointment => `
            <div class="appointment">
                <p>User: ${escapeHtml(appointment.user_name || 'Unknown')}</p>
                <p>Service: ${escapeHtml(appointment.service_name || 'Unknown')}</p>
                <p>Date: ${escapeHtml(appointment.date || 'N/A')}</p>
                <p>Time: ${escapeHtml(appointment.time || 'N/A')}</p>
                <p>Status: ${escapeHtml(appointment.status || 'Unknown')}</p>
                <button onclick="cancelAppointment(${appointment.id}, true)">Cancel</button>
            </div>
        `).join('') : '<p>No appointments available.</p>';
    } catch (error) {
        console.error('Error loading appointments:', error);
        appointmentsDiv.innerHTML = '<p>Failed to load appointments.</p>';
    }
}

async function loadUsers(containerId = 'users') {
    const usersDiv = document.getElementById(containerId);
    if (!usersDiv) {
        console.error(`Users container ${containerId} not found`);
        return;
    }
    usersDiv.innerHTML = '<div class="loading">Loading users...</div>';
    try {
        const response = await fetch('/api/users', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch users: ${response.status}`);
            usersDiv.innerHTML = `<p>Failed to load users (Status: ${response.status}).</p>`;
            return;
        }
        const users = await response.json();
        usersDiv.innerHTML = users.length ? users.map(user => `
            <div class="user">
                <p>Name: ${escapeHtml(user.name || 'Unknown')}</p>
                <p>Email: ${escapeHtml(user.email || 'N/A')}</p>
                <p>Role: ${escapeHtml(user.role || 'Unknown')}</p>
                <p>Status: ${user.active ? 'Active' : 'Inactive'}</p>
                <button onclick="toggleUserStatus(${user.id}, ${user.active})">${user.active ? 'Deactivate' : 'Activate'}</button>
            </div>
        `).join('') : '<p>No users available.</p>';
    } catch (error) {
        console.error('Error loading users:', error);
        usersDiv.innerHTML = '<p>Failed to load users.</p>';
    }
}

async function loadStaff() {
    const staffDiv = document.getElementById('staff');
    if (!staffDiv) {
        console.error('Staff div not found');
        return;
    }
    staffDiv.innerHTML = '<div class="loading">Loading staff...</div>';
    try {
        const response = await fetch('/api/users/staff', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch staff: ${response.status}`);
            staffDiv.innerHTML = `<p>Failed to load staff (Status: ${response.status}).</p>`;
            return;
        }
        const staff = await response.json();
        staffDiv.innerHTML = staff.length ? staff.map(user => `
            <div class="user">
                <p>Name: ${escapeHtml(user.name || 'Unknown')}</p>
                <p>Email: ${escapeHtml(user.email || 'N/A')}</p>
                <p>Role: ${escapeHtml(user.role || 'Unknown')}</p>
                <button onclick="deleteStaff(${user.id})">Remove</button>
            </div>
        `).join('') : '<p>No staff available.</p>';
    } catch (error) {
        console.error('Error loading staff:', error);
        staffDiv.innerHTML = '<p>Failed to load staff.</p>';
    }
}

async function loadStatistics(containerId = 'statistics') {
    const statsDiv = document.getElementById(containerId);
    if (!statsDiv) {
        console.error(`Statistics container ${containerId} not found`);
        return;
    }
    statsDiv.innerHTML = '<div class="loading">Loading statistics...</div>';
    try {
        const response = await fetch('/api/statistics', { credentials: 'include' });
        if (!response.ok) {
            console.error(`Failed to fetch statistics: ${response.status}`);
            statsDiv.innerHTML = `<p>Failed to load statistics (Status: ${response.status}).</p>`;
            return;
        }
        const stats = await response.json();
        statsDiv.innerHTML = `
            <p>Total Bookings: ${escapeHtml(stats.totalBookings || '0')}</p>
            <p>Cancellations: ${escapeHtml(stats.cancellations || '0')}</p>
            <p>Popular Service: ${escapeHtml(stats.popularService || 'None')}</p>
        `;
    } catch (error) {
        console.error('Error loading statistics:', error);
        statsDiv.innerHTML = '<p>Failed to load statistics.</p>';
    }
}

async function handleBooking() {
    const form = document.getElementById('booking-form');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const errorMessage = document.getElementById('booking-error');
    if (!form || !dateInput || !timeSelect || !errorMessage) {
        console.error('Booking form elements not found');
        return;
    }

    dateInput.addEventListener('change', async () => {
        const date = dateInput.value;
        console.log('Selected date:', date);
        if (!date) {
            timeSelect.innerHTML = '<option value="">Select Time</option>';
            return;
        }
        try {
            const response = await fetch(`/api/slots?date=${encodeURIComponent(date)}`, { 
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });
            console.log('Slots response status:', response.status, 'OK:', response.ok);
            if (!response.ok) {
                console.error(`Failed to fetch slots: ${response.status} ${response.statusText}`);
                timeSelect.innerHTML = '<option value="">No slots available</option>';
                return;
            }
            const slots = await response.json();
            console.log('Received slots:', slots);
            if (!Array.isArray(slots) || slots.length === 0) {
                console.warn('No slots returned for date:', date);
                timeSelect.innerHTML = '<option value="">No slots available</option>';
                return;
            }
            timeSelect.innerHTML = '<option value="">Select Time</option>' + 
                slots.map(slot => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join('');
        } catch (error) {
            console.error('Error loading slots:', error);
            timeSelect.innerHTML = '<option value="">No slots available</option>';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceIds = Array.from(document.querySelectorAll('.service-checkbox:checked')).map(cb => cb.value);
        const date = dateInput.value;
        const time = timeSelect.value;

        if (serviceIds.length === 0) {
            errorMessage.textContent = 'Please select at least one service';
            errorMessage.style.display = 'block';
            return;
        }
        if (!date || !time) {
            errorMessage.textContent = 'Please select date and time';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceIds, date, time }),
                credentials: 'include'
            });

            if (response.ok) {
                form.reset();
                document.querySelectorAll('.service-checkbox').forEach(cb => cb.checked = false);
                updateTotalPrice();
                errorMessage.style.display = 'none';
                alert('Appointment booked successfully.');
            } else {
                const errorText = await response.text();
                errorMessage.textContent = errorText || 'Failed to book appointment';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Booking error:', error);
            errorMessage.textContent = 'Network error, please try again';
            errorMessage.style.display = 'block';
        }
    });
}

async function editAppointment(id) {
    const date = prompt('Enter new date (YYYY-MM-DD):');
    const time = prompt('Enter new time (HH:MM):');
    if (date && time) {
        try {
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, time }),
                credentials: 'include'
            });
            if (response.ok) {
                loadUserAppointments();
                alert('Appointment updated successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to update appointment');
            }
        } catch (error) {
            console.error('Error editing appointment:', error);
            alert('Network error, please try again');
        }
    }
}

async function cancelAppointment(id, isStaff = false) {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
        try {
            const response = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
                credentials: 'include'
            });
            if (response.ok) {
                if (isStaff) {
                    loadAllAppointments();
                } else {
                    loadUserAppointments();
                }
                alert('Appointment cancelled successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Network error, please try again');
        }
    }
}

async function toggleUserStatus(id, active) {
    try {
        const response = await fetch(`/api/users/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !active }),
            credentials: 'include'
        });
        if (response.ok) {
            loadUsers();
            alert('User status updated successfully');
        } else {
            const errorText = await response.text();
            alert(errorText || 'Failed to update user status');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Network error, please try again');
    }
}

async function deleteStaff(id) {
    if (confirm('Are you sure you want to remove this staff member?')) {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                loadStaff();
                alert('Staff member removed successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to remove staff member');
            }
        } catch (error) {
            console.error('Error deleting staff:', error);
            alert('Network error, please try again');
        }
    }
}

async function handleServiceManagement() {
    const form = document.getElementById('admin-service-form');
    if (!form) {
        console.error('Service form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('service-name')?.value;
        const description = document.getElementById('service-description')?.value;
        const price = document.getElementById('service-price')?.value;
        const image = document.getElementById('service-image')?.value;
        if (!name || !price) {
            alert('Service name and price are required');
            return;
        }
        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price: parseFloat(price), image }),
                credentials: 'include'
            });
            if (response.ok) {
                loadServices(true);
                form.reset();
                alert('Service added successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            alert('Network error, please try again');
        }
    });
}

async function handleServiceEdit() {
    const form = document.getElementById('edit-service-form');
    if (!form) {
        console.error('Edit service form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-service-id')?.value;
        const name = document.getElementById('edit-service-name')?.value;
        const description = document.getElementById('edit-service-description')?.value;
        const price = document.getElementById('edit-service-price')?.value;
        const image = document.getElementById('edit-service-image')?.value;
        if (!id || !name || !price) {
            alert('Service ID, name, and price are required');
            return;
        }
        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price: parseFloat(price), image }),
                credentials: 'include'
            });
            if (response.ok) {
                loadServices(true);
                form.style.display = 'none';
                alert('Service updated successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to update service');
            }
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Network error, please try again');
        }
    });
}

function editService(id, name, description, price, image) {
    const editForm = document.getElementById('edit-service-form');
    if (!editForm) {
        console.error('Edit service form not found');
        return;
    }
    const idInput = document.getElementById('edit-service-id');
    const nameInput = document.getElementById('edit-service-name');
    const descInput = document.getElementById('edit-service-description');
    const priceInput = document.getElementById('edit-service-price');
    const imageInput = document.getElementById('edit-service-image');
    if (idInput && nameInput && descInput && priceInput && imageInput) {
        idInput.value = id;
        nameInput.value = name;
        descInput.value = decodeURIComponent(description);
        priceInput.value = price;
        imageInput.value = decodeURIComponent(image);
        editForm.style.display = 'block';
    }
}

function cancelEdit() {
    const editForm = document.getElementById('edit-service-form');
    if (editForm) {
        editForm.style.display = 'none';
    }
}

async function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            const response = await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                loadServices(true);
                alert('Service deleted successfully');
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to delete service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Network error, please try again');
        }
    }
}

async function handleSchedule() {
    const form = document.getElementById('schedule-form');
    if (!form) {
        console.error('Schedule form not found');
        return;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('schedule-date')?.value;
        const startTime = document.getElementById('start-time')?.value;
        const endTime = document.getElementById('end-time')?.value;
        const isHoliday = document.getElementById('is-holiday')?.checked;
        if (!date || !startTime || !endTime) {
            alert('Date, start time, and end time are required');
            return;
        }
        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, startTime, endTime, isHoliday }),
                credentials: 'include'
            });
            if (response.ok) {
                alert('Schedule updated successfully');
                form.reset();
            } else {
                const errorText = await response.text();
                alert(errorText || 'Failed to update schedule');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            alert('Network error, please try again');
        }
    });
}

function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeQuotes(text) {
    if (text == null) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}