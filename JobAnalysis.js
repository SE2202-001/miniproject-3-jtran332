const fileUpload = document.getElementById('file-upload');
const filterLevel = document.getElementById('filter-level');
const filterType = document.getElementById('filter-type');
const filterSkill = document.getElementById('filter-skill');
const filterButton = document.getElementById('filter-btn');
const jobListings = document.getElementById('job-listings');

let jobs = []; // store raw data from JSON file
let jobObjects = []; // store Job Objects from jobs array

// job class for encapsulation
class Job {
    constructor(title, posted, type, level, skill, detail) {
        this.title = title;
        this.posted = parseRelativeTime(posted); // convert relative time to a Date
        this.type = type;
        this.level = level;
        this.skill = skill;
        this.detail = detail;
    }

    // format time for printing
    getFormattedPostedTime() {
        if (!this.posted) { return "Unknown time"; }

        const now = new Date();
        // return date in terms of minutes
        const minDiff = Math.floor((now - this.posted) / (1000 * 60));
        if (minDiff < 60) return `${minDiff} minute${minDiff > 1 ? 's' : ''} ago`;
        //return date in terms of hours
        const hourDiff = Math.floor(hourDiff / 60);
        if (hourDiff < 24) return `${hourDiff} hour${hourDiff > 1 ? 's' : ''} ago`;
        // return date in terms of days
        const dayDiff = Math.floor(dayDiff / 24);
        return `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
    }

    // return job details 
    getDetails() {
        return {
            title: this.title,
            posted: this.getFormattedPostedTime(),
            type: this.type,
            level: this.level,
            skill: this.skill,
            detail: this.detail,
        };
    }
}

// parse time from JSON file into useable format
function parseRelativeTime(relativeTime) {
    const now = new Date(); // create object containing current specific time
    const [amount, unit] = relativeTime.split(' '); // separate string into time amount and unit of time

    if (unit.startsWith('minute')) {
        now.setMinutes(now.getMinutes() - parseInt(amount));
    } else if (unit.startsWith('hour')) {
        now.setHours(now.getHours() - parseInt(amount));
    } else if (unit.startsWith('day')) {
        now.setDate(now.getDate() - parseInt(amount));
    }
    return now; // return absolute time corresponding to posted time from JSON file
}

// display job titles that show modal when clicked
function displayJobs(jobArray) {
    jobListings.innerHTML = ''; // clear previous listings

    jobArray.forEach((job) => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job');

        const details = job.getDetails();
        jobDiv.innerHTML = `<p class="job-title">${details.title} - ${details.type} (${details.level})</p>`;

        jobListings.appendChild(jobDiv);

        // show modal when title is clicked
        const jobTitle = jobDiv.querySelector('.job-title');
        jobTitle.addEventListener('click', () => {
            showModal(details);
        });
    });

    // inform user there are no jobs 
    if (jobArray.length === 0) {
        jobListings.innerHTML = '<p>No jobs match the selected filters.</p>';
        return;
    }
}

// handle file upload
fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                jobs = JSON.parse(e.target.result); // parse job data from JSON file
                jobObjects = jobs.map(job => new Job(
                    job.Title,
                    job.Posted,
                    job.Type,
                    job.Level,
                    job.Skill,
                    job.Detail
                ));

                // populate filter dropdowns
                populateFilterOptions(jobObjects);
            } catch (error) {
                alert('Invalid JSON file. Please upload a valid job data file.');
            }
        };
        reader.readAsText(file);
    }
});

// handle populating filter dropdown
function populateFilterOptions(jobArray) {
    const levels = new Set(jobArray.map(job => job.level));
    const skills = new Set(jobArray.map(job => job.skill));
    const types = new Set(jobArray.map(job => job.type));

    // populate level dropdown
    filterLevel.innerHTML = '<option value="">Select Level</option>';
    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        filterLevel.appendChild(option);
    });

    // populate type dropdown
    filterType.innerHTML = '<option value="">Select Type</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        filterType.appendChild(option);
    });

    // populate skill dropdown
    filterSkill.innerHTML = '<option value="">Select Skill</option>';
    skills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        filterSkill.appendChild(option);
    });
}

// filter jobs based on selected criteria
filterButton.addEventListener('click', () => {
    const selectedLevel = filterLevel.value;
    const selectedSkill = filterSkill.value;
    const selectedType = filterType.value;

    // filter jobObjects based on selected criteria
    let filteredJobs = jobObjects;
    if (selectedLevel) { filteredJobs = filteredJobs.filter(job => job.level === selectedLevel); }
    if (selectedSkill) { filteredJobs = filteredJobs.filter(job => job.skill === selectedSkill); }
    if (selectedType) { filteredJobs = filteredJobs.filter(job => job.type === selectedType); }

    // display filtered jobs
    displayJobs(filteredJobs);
});

// sort jobs from A-Z
function sortJobsByTitleAsc(jobArray) {
    return jobArray.sort((a, b) => a.title.localeCompare(b.title));
}

// sort jobs from Z-A
function sortJobsByTitleDesc(jobArray) {
    return jobArray.sort((a, b) => b.title.localeCompare(a.title));
}

// sort jobs by posted time (oldest-newest)
function sortJobsByPostedTimeAsc(jobArray) {
    return jobArray.sort((a, b) => a.posted - b.posted);
}

// sort jobs by posted time (newest-oldest)
function sortJobsByPostedTimeDesc(jobArray) {
    return jobArray.sort((a, b) => b.posted - a.posted);
}

const sortTitleSelect = document.getElementById('sort-title');
const sortPostedSelect = document.getElementById('sort-posted');
const applySortingButton = document.getElementById('apply-sorting');

// apply sorting
applySortingButton.addEventListener('click', () => {
    let sortedJobs = [...jobObjects];  // copy the jobObjects array to avoid direct mutation

    // sort by title based on selected option
    if (sortTitleSelect.value === 'asc') {
        sortedJobs = sortJobsByTitleAsc(sortedJobs);
    } else {
        sortedJobs = sortJobsByTitleDesc(sortedJobs);
    }

    // sort by posted time based on selected option
    if (sortPostedSelect.value === 'asc') {
        sortedJobs = sortJobsByPostedTimeAsc(sortedJobs);
    } else {
        sortedJobs = sortJobsByPostedTimeDesc(sortedJobs);
    }

    // display the sorted jobs
    displayJobs(sortedJobs);
});

// modal (popup) constants
const jobModal = document.getElementById('job-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalType = document.getElementById('modal-type');
const modalLevel = document.getElementById('modal-level');
const modalSkill = document.getElementById('modal-skill');
const modalPosted = document.getElementById('modal-posted');
const modalDetail = document.getElementById('modal-detail');

// show the modal with the job details
function showModal(details) {
    // set the modal content
    modalTitle.textContent = `${details.title}`;
    modalType.textContent = `Type: ${details.type}`;
    modalLevel.textContent = `Level: ${details.level}`;
    modalSkill.textContent = `Skill: ${details.skill}`;
    modalDetail.textContent = `Details: ${details.detail}`;
    modalPosted.textContent = `Posted: ${details.posted}`;

    // show the modal
    jobModal.style.display = 'block';
}

// close the modal when the user clicks the close button
closeModal.addEventListener('click', () => {
    jobModal.style.display = 'none'; // Hide the modal
});

// close the modal if the user clicks anywhere outside the modal
window.addEventListener('click', (event) => {
    if (event.target === jobModal) {
        jobModal.style.display = 'none';
    }
});
