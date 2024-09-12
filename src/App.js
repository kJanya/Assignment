// App.js
import React, { useState, useEffect } from 'react';
import './style.css';

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [groupBy, setGroupBy] = useState(
    localStorage.getItem('groupBy') || 'By Status'
  );
  const [sortBy, setSortBy] = useState(
    localStorage.getItem('sortBy') || 'Priority'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(
          'https://api.quicksell.co/v1/internal/frontend-assignment'
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('API Response:', data); // Log the API response

        // Check if data is an object with an array property or another format
        if (Array.isArray(data)) {
          setTickets(data);
        } else if (data && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        } else if (data && data.data && Array.isArray(data.data)) {
          setTickets(data.data);
        } else {
          throw new Error('Unexpected data format');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
    localStorage.setItem('sortBy', sortBy);
  }, [groupBy, sortBy]);

  const groupTickets = () => {
    const grouped = tickets.reduce((acc, ticket) => {
      const key = ticket[groupBy.replace('By ', '').toLowerCase()];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(ticket);
      return acc;
    }, {});

    return grouped;
  };

  const sortedTickets = () => {
    const grouped = groupTickets();
    const sorted = Object.keys(grouped).reduce((acc, key) => {
      const sortedGroup = [...grouped[key]].sort((a, b) => {
        if (sortBy === 'Priority') {
          return b.priority - a.priority;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
      acc[key] = sortedGroup;
      return acc;
    }, {});

    return sorted;
  };

  const handleGroupChange = (e) => {
    setGroupBy(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app">
      <header>
        <h1>Kanban Board</h1>
        <div className="controls">
          <label>
            Group By:
            <select value={groupBy} onChange={handleGroupChange}>
              <option value="By Status">Status</option>
              <option value="By User">User</option>
              <option value="By Priority">Priority</option>
            </select>
          </label>
          <label>
            Sort By:
            <select value={sortBy} onChange={handleSortChange}>
              <option value="Priority">Priority</option>
              <option value="Title">Title</option>
            </select>
          </label>
        </div>
      </header>
      <main>
        {Object.keys(sortedTickets()).map((groupKey) => (
          <div key={groupKey} className="group">
            <h2>{groupKey}</h2>
            <ul>
              {sortedTickets()[groupKey].map((ticket) => (
                <li
                  key={ticket.id}
                  className={`ticket priority-${ticket.priority}`}
                >
                  <h3>{ticket.title}</h3>
                  <p>Status: {ticket.status}</p>
                  <p>Assigned to: {ticket.user}</p>
                  <p>
                    Priority:{' '}
                    {
                      ['No priority', 'Low', 'Medium', 'High', 'Urgent'][
                        ticket.priority
                      ]
                    }
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
};

export default App;
