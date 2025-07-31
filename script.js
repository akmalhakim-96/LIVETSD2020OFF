// Helper function to parse time string (e.g., "8:30 Pagi", "1:00 Petang") and return hours and minutes in 24-hour format
function parseEventCardTime(timeStr) {
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period.toLowerCase() === 'petang' && hours !== 12) {
        hours += 12;
    } else if (period.toLowerCase() === 'pagi' && hours === 12) { // Midnight (12 AM)
        hours = 0;
    }
    return { hours, minutes };
}

// Helper function to parse schedule time string (e.g., "8.30am", "12.30pm") and return hours and minutes in 24-hour format
function parseScheduleTime(timeStr) {
    let hours, minutes;
    let period = timeStr.slice(-2).toLowerCase(); // 'am' or 'pm'
    let time = timeStr.slice(0, -2); // '8.30' or '12.30'

    if (time.includes('.')) {
        [hours, minutes] = time.split('.').map(Number);
    } else {
        hours = Number(time);
        minutes = 0;
    }

    if (period === 'pm' && hours !== 12) {
        hours += 12;
    } else if (period === 'am' && hours === 12) { // Midnight (12 AM)
        hours = 0;
    }
    return { hours, minutes };
}

// Fungsi untuk menguruskan butang kembali ke atas
// mybutton is now retrieved inside scrollFunction to avoid null issues
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    let mybutton = document.getElementById("backToTopBtn"); // Get button inside function
    if (mybutton) { // Check if button exists
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }
}

function topFunction() {
    document.body.scrollTop = 0; // Untuk Safari
    document.documentElement.scrollTop = 0; // Untuk Chrome, Firefox, IE dan Opera
}

// Fungsi untuk menandakan acara langsung dan mengendalikan butang "Tonton Live Sekarang"
document.addEventListener('DOMContentLoaded', function() {
    // No need to initialize mybutton here as it's handled in scrollFunction
    // let mybutton = document.getElementById("backToTopBtn"); 
    // Set initial display based on scroll position
    scrollFunction();


    const eventCards = document.querySelectorAll('#acara .card');
    const watchLiveBtn = document.getElementById('watchLiveBtn');
    const liveStreamContainer = document.getElementById('live-stream-container');
    const liveSectionTitle = document.getElementById('live-section-title'); // Get the h2 element
    const summaryModal = document.getElementById('summaryModal');
    const closeButton = document.querySelector('.close-button');
    const summaryContent = document.getElementById('summaryContent');
    const summaryLoading = document.getElementById('summaryLoading');
    const modalTitle = document.getElementById('modalTitle'); // Get modal title element

    // Explicitly hide the modal on load to prevent any flicker or unintended display
    summaryModal.style.display = 'none';

    let liveEventsToday = []; // Stores events that are live today
    let allEventsData = []; // Stores data for all events to sort if no live events

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // Month is 0-indexed (e.g., July is 6, August is 7)
    const currentYear = today.getFullYear(); // Assuming 2025 based on the page title and hero section
    const currentDateTime = new Date(); // Current time with full date and time

    // Mapping for month names to 0-indexed month numbers
    const monthMap = {
        'JAN': 0, 'FEB': 1, 'MAC': 2, 'APR': 3, 'MEI': 4, 'JUN': 5,
        'JULAI': 6, 'JUL': 6,
        'OGOS': 7, 'OGS': 7,
        'SEP': 8, 'OKT': 9, 'NOV': 10, 'DIS': 11
    };

    eventCards.forEach(card => {
        const dateElement = card.querySelector('.event-date');
        const eventNameElement = card.querySelector('.event-name');
        const eventLocationElement = card.querySelector('p:nth-of-type(2)'); // Second p tag for location
        const eventTimeElement = card.querySelector('p:nth-of-type(3)'); // Third p tag for time
        const liveBadge = card.querySelector('.live-badge'); // This badge is for the card, not the schedule modal
        const generateSummaryBtn = card.querySelector('.generate-summary-btn');

        // Declare youtubeUrl here to make it accessible within the loop
        let youtubeUrl = "https://www.youtube.com/embed/live_stream?channel=UC_x5zY0nKk8L1k7kR2_K_gQ&autoplay=1"; // Default placeholder

        // Ensure the card's live badge is always hidden
        if (liveBadge) {
            liveBadge.classList.add('hidden');
        }

        if (dateElement && eventNameElement && eventLocationElement && eventTimeElement && generateSummaryBtn) {
            const dateText = dateElement.textContent.trim();
            const originalTimeText = eventTimeElement.textContent.trim();
            const parts = dateText.split(' ');
            const day = parseInt(parts[0]);
            const monthName = parts[1].toUpperCase();
            const eventMonth = monthMap[monthName] !== undefined ? monthMap[monthName] : -1;

            const timeText = originalTimeText.replace('Masa: ', '');
            const [startTimeStr, endTimeStr] = timeText.split(' - ');

            const parsedStartTime = parseEventCardTime(startTimeStr);
            const parsedEndTime = parseEventCardTime(endTimeStr);

            const eventStartDateTime = new Date(currentYear, eventMonth, day, parsedStartTime.hours, parsedStartTime.minutes, 0);
            const eventEndDateTime = new Date(currentYear, eventMonth, day, parsedEndTime.hours, parsedEndTime.minutes, 0);

            const eventName = eventNameElement.textContent.trim();
            // Determine YouTube URL based on event name (ADD YOUR SPECIFIC YOUTUBE EMBED LINKS HERE)
            switch (eventName.toLowerCase()) {
                case 'dodgeball':
                    youtubeUrl = "https://www.youtube.com/embed/PJCgK-eE148"; // Gantikan dengan pautan Dodgeball sebenar
                    break;
                case 'netball':
                    youtubeUrl = "https://www.youtube.com/embed/R0cVMNhUMrU"; // Gantikan dengan pautan Netball sebenar
                    break;
                case 'futsal':
                    youtubeUrl = "https://www.youtube.com/embed/KcNSvONDA44"; // Gantikan dengan pautan Futsal sebenar
                    break;
                case 'pickeball':
                    youtubeUrl = "https://www.youtube.com/embed/jTW2RNEKjyk"; // Gantikan dengan pautan Pickeball sebenar
                    break;
                // Tambah kes lain jika ada acara baru
            }

            const eventData = {
                day: day,
                month: eventMonth,
                year: currentYear,
                name: eventName,
                location: eventLocationElement.textContent.trim(),
                time: originalTimeText,
                normalizedName: eventName.toLowerCase().replace(/[^a-z0-9]+/g, ''),
                youtubeUrl: youtubeUrl,
                startDateTime: eventStartDateTime,
                endDateTime: eventEndDateTime
            };
            allEventsData.push(eventData);

            const eventDateOnly = new Date(currentYear, eventMonth, day);
            const todayDateOnly = new Date(currentYear, currentMonth, currentDay);

            // Check if event is currently live (today and within time)
            const isCurrentlyLive = (eventDateOnly.toDateString() === todayDateOnly.toDateString() &&
                                    currentDateTime >= eventStartDateTime && currentDateTime <= eventEndDateTime);

            // Check if event date has passed (regardless of time)
            const hasPassed = eventDateOnly < todayDateOnly;

            // Apply live styling if currently live
            if (isCurrentlyLive) {
                card.classList.add('live-event');
                liveEventsToday.push(eventData);
                eventTimeElement.textContent = 'Sedang Berlangsung'; // Change time text to "Sedang Berlangsung"
                generateSummaryBtn.textContent = 'Jadual Live'; // Change button text for live event
            } else {
                card.classList.remove('live-event'); // Remove live styling if not live
                if (hasPassed) {
                    generateSummaryBtn.textContent = 'Keputusan'; // Change button text for past event
                } else {
                    generateSummaryBtn.textContent = 'Jadual Perlawanan'; // Default for upcoming event
                }
                eventTimeElement.textContent = originalTimeText; // Revert to original time text
            }
        }
    });

    // Function to create a live stream card HTML
    function getLiveStreamCardHtml(event, isLiveCard = false) { // Added isLiveCard parameter
        // Determine the ID for the live stream card based on the event name
        const liveStreamId = `live-${event.normalizedName}`;
        const title = `Langsung: ${event.name}`;
        const description = `${event.location}, ${event.time}`; // Using location and time from event data

        const liveClass = isLiveCard ? 'live-event' : '';
        const liveBadgeHtml = isLiveCard ? '<span class="live-badge">LIVE</span>' : ''; 

        return `
            <div class="bg-white rounded-lg shadow-xl overflow-hidden card relative ${liveClass}" id="${liveStreamId}">
                <div class="p-6">
                    <h3 class="text-2xl font-semibold mb-4 text-center text-gray-800">${title}</h3>
                    <div class="video-container">
                        <iframe
                            src="${event.youtubeUrl}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <p class="text-gray-600 mt-4 text-center">${description}</p>
                    ${liveBadgeHtml}
                </div>
            </div>
        `;
    }

    // Render the Live Stream section based on live events
    liveStreamContainer.innerHTML = ''; // Clear existing content

    if (liveEventsToday.length > 0) {
        // Show only live events
        liveEventsToday.forEach(event => {
            liveStreamContainer.innerHTML += getLiveStreamCardHtml(event, true); // Pass true for isLiveCard
        });
        // Set the "Tonton Live Sekarang" button to open the YouTube URL in a new tab
        watchLiveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(liveEventsToday[0].youtubeUrl, '_blank'); // Open in new tab
        });
        liveSectionTitle.textContent = 'Sedang Berlangsung'; // Set title if live events
    } else {
        // No live events, show all events sorted by date
        allEventsData.sort((a, b) => {
            const dateA = new Date(a.year, a.month, a.day);
            const dateB = new Date(b.year, b.month, b.day);
            return dateA - dateB;
        });

        allEventsData.forEach(event => {
            liveStreamContainer.innerHTML += getLiveStreamCardHtml(event, false); // Pass false for isLiveCard
        });
        // Set the "Tonton Live Sekarang" button to scroll to the top of the live section
        watchLiveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.getElementById('live');
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
        liveSectionTitle.textContent = 'Acara Sukan'; // Change title if no live events
    }

    // Helper function to extract only the team name (e.g., "CYBORG" from "MERAH (CYBORG)")
    function getTeamNameOnly(fullTeamName) {
        const match = /\(([^)]+)\)/.exec(fullTeamName);
        return match ? match[1] : fullTeamName;
    }

    // Define the schedule data for 11 OGOS
    const scheduleData11Ogos = [
        { time: "8.30am", category: "B (Y3-Y4) PEREMPUAN", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 15 },
        { time: "8.45am", category: "", match: [{name: "KUNING (VOLTRA)", color: "yellow"}, {name: "MERAH (CYBORG)", color: "red"}], durationMinutes: 15 },
        { time: "9.00am", category: "B (Y3-Y4) LELAKI", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 15 },
        { time: "9.15am", category: "", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "KUNING (VOLTRA)", color: "yellow"}], durationMinutes: 15 },
        { time: "9.30am", category: "C (Y5-Y6) PEREMPUAN", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "KUNING (VOLTRA)", color: "yellow"}], durationMinutes: 15 },
        { time: "9.45am", category: "", match: [{name: "BIRU (MECHA)", color: "blue"}, {name: "MERAH (CYBORG)", color: "red"}], durationMinutes: 15 },
        { time: "10.00am", category: "C (Y5-Y6) LELAKI", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 15 },
        { time: "10.15am", category: "", match: [{name: "KUNING (VOLTRA)", color: "yellow"}, {name: "HIJAU (TECHNO)", color: "green"}], durationMinutes: 15 },
        { time: "10.30am", category: "B (Y3-Y4) PEREMPUAN", match: "TEMPAT KE-3/4", durationMinutes: 15 },
        { time: "10.45am", category: "B (Y3-Y4) LELAKI", match: "TEMPAT KE-3/4", durationMinutes: 15 },
        { time: "11.00am", category: "C (Y5-Y6) PEREMPUAN", match: "TEMPAT KE-3/4", durationMinutes: 15 },
        { time: "11.15am", category: "C (Y5-Y6) LELAKI", match: "TEMPAT KE-3/4", durationMinutes: 15 },
        { time: "11.30am", category: "B (Y3-Y4) PEREMPUAN", match: "PERLAWANAN AKHIR", durationMinutes: 15 },
        { time: "11.45am", category: "B (Y3-Y4) LELAKI", match: "PERLAWANAN AKHIR", durationMinutes: 15 },
        { time: "12.00pm", category: "C (Y5-Y6) PEREMPUAN", match: "PERLAWANAN AKHIR", durationMinutes: 15 },
        { time: "12.15pm", category: "C (Y5-Y6) LELAKI", match: "PERLAWANAN AKHIR", durationMinutes: 15 },
        { time: "12.30pm", category: "", match: "PENYAMPAIAN HADIAH", durationMinutes: 30 }
    ];

    // Define the schedule data for 12 OGOS
    const scheduleData12Ogos = [
        { time: "8.30am", category: "B (Y3-Y4) PEREMPUAN", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "KUNING (VOLTRA)", color: "yellow"}], durationMinutes: 20 },
        { time: "8.50am", category: "", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 20 },
        { time: "9.10am", category: "C (Y5-Y6) PEREMPUAN", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 20 },
        { time: "9.30am", category: "", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "KUNING (VOLTRA)", color: "yellow"}], durationMinutes: 20 },
        { time: "9.50am", category: "B (Y3-Y4) PEREMPUAN", match: "TEMPAT KE-3/4", durationMinutes: 20 },
        { time: "10.10am", category: "C (Y5-Y6) PEREMPUAN", match: "TEMPAT KE-3/4", durationMinutes: 20 },
        { time: "10.30am", category: "B (Y3-Y4) PEREMPUAN", match: "PERLAWANAN AKHIR", durationMinutes: 20 },
        { time: "10.50am", category: "C (Y5-Y6) PEREMPUAN", match: "PERLAWANAN AKHIR", durationMinutes: 25 },
        { time: "11.15am", category: "", match: "PENYAMPAIAN HADIAH", durationMinutes: 45 }
    ];

    // Define the schedule data for 13 OGOS
    const scheduleData13Ogos = [
        { time: "8.30am", category: "B (Y3-Y4) LELAKI", match: [{name: "KUNING (VOLTRA)", color: "yellow"}, {name: "HIJAU (TECHNO)", color: "green"}], durationMinutes: 20 },
        { time: "8.50am", category: "", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 20 },
        { time: "9.10am", category: "C (Y5-Y6) LELAKI", match: [{name: "KUNING (VOLTRA)", color: "yellow"}, {name: "HIJAU (TECHNO)", color: "green"}], durationMinutes: 20 },
        { time: "9.30am", category: "", match: [{name: "BIRU (MECHA)", color: "blue"}, {name: "MERAH (CYBORG)", color: "red"}], durationMinutes: 20 },
        { time: "9.50am", category: "B (Y3-Y4) LELAKI", match: "TEMPAT KE-3/4", durationMinutes: 20 },
        { time: "10.10am", category: "C (Y5-Y6) LELAKI", match: "TEMPAT KE-3/4", durationMinutes: 20 },
        { time: "10.30am", category: "B (Y3-Y4) LELAKI", match: "PERLAWANAN AKHIR", durationMinutes: 20 },
        { time: "10.50am", category: "C (Y5-Y6) LELAKI", match: "PERLAWANAN AKHIR", durationMinutes: 25 },
        { time: "11.15am", category: "", match: "PENYAMPAIAN HADIAH", durationMinutes: 45 }
    ];

    // Define the schedule data for 14 OGOS
    const scheduleData14Ogos = [
        { time: "8.30am", category: "D (F1-F3) PEREMPUAN", match: [{name: "KUNING (VOLTRA)", color: "yellow"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 30 },
        { time: "9.00am", category: "", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "MERAH (CYBORG)", color: "red"}], durationMinutes: 30 },
        { time: "9.30am", category: "D (F1-F3) LELAKI", match: [{name: "MERAH (CYBORG)", color: "red"}, {name: "BIRU (MECHA)", color: "blue"}], durationMinutes: 30 },
        { time: "10.00am", category: "", match: [{name: "HIJAU (TECHNO)", color: "green"}, {name: "KUNING (VOLTRA)", color: "yellow"}], durationMinutes: 30 },
        { time: "10.30am", category: "D (F1-F3) PEREMPUAN", match: "TEMPAT KE-3/4", durationMinutes: 30 },
        { time: "11.00am", category: "D (F1-F3) LELAKI", match: "TEMPAT KE-3/4", durationMinutes: 30 },
        { time: "11.30am", category: "D (F1-F3) PEREMPUAN", match: "PERLAWANAN AKHIR", durationMinutes: 30 },
        { time: "12.00pm", category: "D (F1-F3) LELAKI", match: "PERLAWANAN AKHIR", durationMinutes: 30 },
        { time: "12.30pm", category: "", match: "PENYAMPAIAN HADIAH", durationMinutes: 30 }
    ];


    // Gemini API Integration: Event Summary Generator
    const generateSummaryButtons = document.querySelectorAll('.generate-summary-btn');
    generateSummaryButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const card = this.closest('.card');
            const eventDateText = card.querySelector('.event-date').textContent.trim();
            const eventName = card.querySelector('.event-name').textContent.trim();
            const eventLocation = card.querySelector('p:nth-of-type(2)').textContent.trim();
            const eventTime = card.querySelector('.event-time').textContent.trim();

            summaryContent.innerHTML = ''; // Clear previous content, use innerHTML
            summaryLoading.classList.remove('hidden'); // Show loading indicator
            summaryModal.style.display = 'flex'; // Show modal

            // Parse the event date from the card for comparison
            const dateParts = eventDateText.split(' ');
            const eventDay = parseInt(dateParts[0]);
            const eventMonthName = dateParts[1].toUpperCase();
            const eventMonth = monthMap[eventMonthName] !== undefined ? monthMap[eventMonthName] : -1;
            const eventYear = currentYear; // Assuming current year for event dates

            const eventDateObj = new Date(eventYear, eventMonth, eventDay);
            const todayDateObj = new Date(currentYear, currentMonth, currentDay);

            const hasEventDatePassed = eventDateObj < todayDateObj;

            if (hasEventDatePassed) {
                // If the event date has passed, show the results link
                modalTitle.textContent = 'Keputusan Perlawanan'; // Set modal title for results
                summaryContent.innerHTML = `
                    <p class="text-center mb-4">Keputusan untuk acara ini boleh didapati di:</p>
                    <a href="https://challonge.com/events/TINTASPORTSDAY2025/tournaments" target="_blank" class="block text-center text-blue-600 hover:text-blue-800 font-bold text-lg underline">Lihat Keputusan di Challonge</a>
                    <p class="text-center mt-4 text-sm text-gray-500">Pautan akan dibuka dalam tab baharu.</p>
                `;
                summaryLoading.classList.add('hidden');
            } else {
                // Set modal title for schedules
                modalTitle.textContent = 'Jadual Perlawanan'; 
                // Existing logic for current/upcoming events
                const currentModalDateTime = new Date(currentYear, currentMonth, currentDay, currentDateTime.getHours(), currentDateTime.getMinutes(), 0);

                let scheduleToDisplay = [];
                if (eventDateText === '11 OGOS') {
                    scheduleToDisplay = scheduleData11Ogos;
                } else if (eventDateText === '12 OGOS') {
                    scheduleToDisplay = scheduleData12Ogos;
                } else if (eventDateText === '13 OGOS') {
                    scheduleToDisplay = scheduleData13Ogos;
                } else if (eventDateText === '14 OGOS') {
                    scheduleToDisplay = scheduleData14Ogos;
                }

                if (scheduleToDisplay.length > 0) {
                    let scheduleHtml = '<div class="space-y-3 text-left">';
                    scheduleToDisplay.forEach(entry => {
                        const parsedEntryTime = parseScheduleTime(entry.time);
                        const entryStartDateTime = new Date(currentYear, currentMonth, currentDay, parsedEntryTime.hours, parsedEntryTime.minutes, 0);
                        const entryEndDateTime = new Date(entryStartDateTime.getTime() + entry.durationMinutes * 60 * 1000);

                        const isLive = currentModalDateTime >= entryStartDateTime && currentModalDateTime <= entryEndDateTime;
                        // Use schedule-live-badge for the badge inside the modal
                        const liveBadge = isLive ? '<span class="schedule-live-badge">LIVE</span>' : '';

                        let matchContent;
                        if (Array.isArray(entry.match)) {
                            const team1 = entry.match[0];
                            const team2 = entry.match[1];
                            matchContent = `<span class="team-name text-${team1.color}-700">${getTeamNameOnly(team1.name)}</span> LWN <span class="team-name text-${team2.color}-700">${getTeamNameOnly(team2.name)}</span>`;
                        } else {
                            matchContent = `<strong>${entry.match}</strong>`;
                        }

                        scheduleHtml += `
                            <div class="schedule-entry">
                                <span class="schedule-time">${entry.time}</span>${liveBadge}
                                ${entry.category ? `<span class="category-info">Kategori: ${entry.category}</span><br>` : ''}
                                ${matchContent}
                            </div>
                        `;
                    });
                    scheduleHtml += '</div>';
                    summaryContent.innerHTML = scheduleHtml;
                    summaryLoading.classList.add('hidden');
                } else {
                    // Call Gemini API for events without specific schedules (e.g., future events without hardcoded schedule)
                    const prompt = `Berikan ringkasan menarik tentang acara sukan ${eventName} yang akan berlangsung di ${eventLocation} pada ${eventTime}. Fokuskan pada apa yang boleh dijangkakan oleh penonton dan mengapa ia menarik.`;

                    console.log('Prompt dihantar ke Gemini API:', prompt);

                    try {
                        let chatHistory = [];
                        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                        const payload = { contents: chatHistory };
                        const apiKey = "";
                        // Mengemaskini API URL untuk menggunakan model gemini-2.5-flash-preview-05-20
                        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const result = await response.json();
                        console.log('Respons daripada Gemini API:', result);

                        if (result.candidates && result.candidates.length > 0 &&
                            result.candidates[0].content && result.candidates[0].content.parts &&
                            result.candidates[0].content.parts.length > 0) {
                            const text = result.candidates[0].content.parts[0].text;
                            summaryContent.textContent = text;
                        } else {
                            console.error('Struktur respons tidak dijangka atau kandungan hilang:', result);
                            summaryContent.textContent = 'AYUH BERSAMA MEMBERIKAN SOKONGAN KEPADA PASUKAN ANDA';
                        }
                    } catch (error) {
                        console.error('Ralat semasa memanggil Gemini API:', error);
                        summaryContent.textContent = 'Ralat sambungan. Sila cuba lagi.';
                    } finally {
                        summaryLoading.classList.add('hidden');
                    }
                }
            }
        });
    });

    // Close modal when close button is clicked
    closeButton.addEventListener('click', function() {
        summaryModal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target == summaryModal) {
            summaryModal.style.display = 'none';
        }
    });
});
