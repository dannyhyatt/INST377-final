import { Calendar } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import rrule from '@fullcalendar/rrule';
import './style.css'
import { createClient } from '@supabase/supabase-js'
import * as ical from 'ical.js';


function uploadFile(image: string) {
  const supabase = createClient('https://wxllnzdbcwzydikbqvvu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bGxuemRiY3d6eWRpa2JxdnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTQ1ODIsImV4cCI6MjA1NjU5MDU4Mn0.Z428Q_P28lWSxu57_6F90n7pkCZVOSRfLigxqHHjCjM')
  supabase.functions.invoke('gen_calendar', { body: JSON.stringify({ "image": image }) }).then(({ data, error }) => {
    if(error) {
      console.error('error', error);
    }
    if(data) {
      console.log('data', data);
      const ics = ical.default.parse(data.calendar as string);
      console.log('ics', ics);
      const eventsArrays = ics[2];
      const events = [];
      for (let event of eventsArrays) {
        console.log('event', event);
        const eventDetails: any = {};
        const eventDetailsArrays = event[1];
        console.log('eventDetailsArrays', eventDetailsArrays);
        for (let i = 0; i < eventDetailsArrays.length; i++) {
          const eventDetail = eventDetailsArrays[i];
          console.log('eventDetail', eventDetail);
          if (eventDetail[0] === 'summary') {
            eventDetails['title'] = eventDetail[3];
          } else if (eventDetail[0] === 'dtstart') {
            eventDetails['start'] = new Date(eventDetail[3]).setFullYear(new Date().getFullYear());
          }
          else if (eventDetail[0] === 'dtend') {
            eventDetails['end'] = new Date(eventDetail[3]).setFullYear(new Date().getFullYear());
          }
          else if (eventDetail[0] === 'location') {
            eventDetails['location'] = eventDetail[3];
          }
          else if (eventDetail[0] === 'description') {
            eventDetails['description'] = eventDetail[3];
          }
          else if (eventDetail[0] === 'url') {
            eventDetails['url'] = eventDetail[3];
          }
          else if (eventDetail[0] === 'rrule') {
            eventDetails['rrule'] = `FREQ=${eventDetail[3].freq};BYDAY=${eventDetail[3].byday};COUNT=16`;
          }
        }
        console.log('eventDetails', eventDetails);
        events.push(eventDetails);
      }
      console.log('events', events);
      document.getElementById('file-preview')!.style.display = 'flex';
      const calendarDiv = document.getElementById('calendar');
      let calendar = new Calendar(calendarDiv!, {
        plugins: [ dayGridPlugin, timeGridPlugin, listPlugin, rrule ],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: events,
      });
      calendar.render();

      const downloadButton = document.getElementById('download-button');
      if (downloadButton) {
        downloadButton.addEventListener('click', () => {
          const blob = new Blob([data.calendar], { type: 'text/calendar' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'calendar.ics';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }
    }
  })
}

function fileDragOver(e: DragEvent | MouseEvent) {
  const fileUploadElement = document.getElementById('file-upload');
  if (fileUploadElement) {
    (fileUploadElement as HTMLElement).style.backgroundColor = '#d0d0d0';
  }
  e.preventDefault()
}

function fileDragLeave(e: DragEvent | MouseEvent) {
  const fileUploadElement = document.getElementById('file-upload');
  if (fileUploadElement) {
    (fileUploadElement as HTMLElement).style.backgroundColor = '#f0f0f0';
  }
  e.preventDefault()
}

function fileDrop(e: DragEvent) {

  const fileUploadElement = document.getElementById('file-upload');
  if (fileUploadElement) {
    (fileUploadElement as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0)';
  }
  if (e.dataTransfer && e.dataTransfer.items) {
    const fileReader = new FileReader();
    e.dataTransfer.items[0].getAsFile();
    fileReader.addEventListener('load', (e) => {
      console.log('fileReader.result', e.target?.result);
      uploadFile(e.target?.result as string);
    })
    fileReader.readAsDataURL(e.dataTransfer.items[0].getAsFile()!);
  }
  e.preventDefault()
}

function uploadElementClick(e: MouseEvent) {
  console.log('uploadElementClick', e)
  const fileUploadElement = document.getElementById('file-input');
  if (fileUploadElement) {
    (fileUploadElement as HTMLInputElement).click();
  }
  // e.preventDefault()
}

function fileInputChange(e: Event) {
  const fileUploadElement = document.getElementById('file-input');
  if (fileUploadElement) {
    const fileReader = new FileReader();
    const file = (fileUploadElement as HTMLInputElement).files?.[0];
    if (file) {
      fileReader.addEventListener('load', (e) => {
        console.log('fileReader.result', e.target?.result);
        uploadFile(e.target?.result as string);
      })
      fileReader.readAsDataURL(file);
    }
  }
  e.preventDefault()
}

const fileUploadElement = document.getElementById('file-upload');
if (fileUploadElement) {
  console.log('fileUploadElement', fileUploadElement)
  fileUploadElement.addEventListener('dragover', fileDragOver);
  fileUploadElement.addEventListener('dragenter', fileDragOver);
  fileUploadElement.addEventListener('mouseenter', fileDragOver);
  fileUploadElement.addEventListener('dragleave', fileDragLeave);
  fileUploadElement.addEventListener('dragend', fileDragLeave);
  fileUploadElement.addEventListener('mouseleave', fileDragLeave);
  fileUploadElement.addEventListener('drop', fileDrop);

  fileUploadElement.addEventListener('click', uploadElementClick);
}

const fileInputElement = document.getElementById('file-input');
if (fileInputElement) {
  fileInputElement.addEventListener('change', fileInputChange);
}