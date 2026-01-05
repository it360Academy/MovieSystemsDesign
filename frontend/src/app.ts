// Types inline for browser compatibility
interface QueryRequest {
  prompt: string;
  options?: {
    genre?: string;
    minRevenue?: number;
    minRating?: number;
    sentimentThreshold?: number;
  };
}

interface QueryResponse {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
  summary?: string;
}

const API_URL = 'http://localhost:3001/api';

const samplePrompts = [
  'Recommend action movies with high revenue and positive sentiment',
  'Summarize preferences for user based on their ratings and movie overviews',
  'Find sci-fi movies with budget over 50 million',
  'Show me the top 10 highest revenue movies'
];

let currentRequest: AbortController | null = null;

function initApp() {
  const promptTextarea = document.getElementById('prompt') as HTMLTextAreaElement;
  const genreInput = document.getElementById('genre') as HTMLInputElement;
  const minRevenueInput = document.getElementById('minRevenue') as HTMLInputElement;
  const minRatingInput = document.getElementById('minRating') as HTMLInputElement;
  const runButton = document.getElementById('runBtn') as HTMLButtonElement;
  const sampleButtons = document.getElementById('samplePrompts') as HTMLDivElement;
  const resultsDiv = document.getElementById('results') as HTMLDivElement;
  const loadingDiv = document.getElementById('loading') as HTMLDivElement;
  const errorDiv = document.getElementById('error') as HTMLDivElement;

  samplePrompts.forEach(prompt => {
    const btn = document.createElement('button');
    btn.className = 'sample-btn';
    btn.textContent = prompt;
    btn.onclick = () => {
      promptTextarea.value = prompt;
    };
    sampleButtons.appendChild(btn);
  });

  runButton.onclick = async () => {
    if (currentRequest) {
      currentRequest.abort();
    }
    currentRequest = new AbortController();

    const prompt = promptTextarea.value.trim();
    if (!prompt) {
      showError('Please enter a prompt');
      return;
    }

    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    resultsDiv.innerHTML = '';

    const options: QueryRequest['options'] = {};
    if (genreInput.value) options.genre = genreInput.value;
    if (minRevenueInput.value) options.minRevenue = parseFloat(minRevenueInput.value);
    if (minRatingInput.value) options.minRating = parseFloat(minRatingInput.value);

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, options }),
        signal: currentRequest.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: QueryResponse = await response.json();
      displayResults(data);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        showError(error.message || 'Failed to fetch results');
      }
    } finally {
      loadingDiv.style.display = 'none';
      currentRequest = null;
    }
  };
}

function displayResults(data: QueryResponse) {
  const resultsDiv = document.getElementById('results') as HTMLDivElement;
  resultsDiv.innerHTML = '';

  if (data.summary) {
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary';
    summaryDiv.textContent = data.summary;
    resultsDiv.appendChild(summaryDiv);
  }

  if (data.rows.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty';
    emptyDiv.textContent = 'No results found';
    resultsDiv.appendChild(emptyDiv);
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  data.columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.rows.forEach(row => {
    const tr = document.createElement('tr');
    data.columns.forEach(col => {
      const td = document.createElement('td');
      const value = row[col];
      td.textContent = value != null ? String(value) : '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  resultsDiv.appendChild(table);
}

function showError(message: string) {
  const errorDiv = document.getElementById('error') as HTMLDivElement;
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
