import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PublishedSheetDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const SHEET_ID = '15Hzg5ajtqTSdxkM9JwwSqkrRrSPjTWMKsPI3a5OT6ao';
        
        // Try the visualization API endpoint
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
        
        setDebugInfo('Fetching data...');
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        setDebugInfo(prev => prev + '\nReceived response...');
        
        // Remove the Google Visualization API prefix and suffix
        const jsonString = text.substring(47).slice(0, -2);
        const jsonData = JSON.parse(jsonString);
        
        setDebugInfo(prev => prev + '\nParsed JSON data...');
        
        // Transform the data
        const users = jsonData.table.rows.map(row => {
          const user = {
            flatNo: row.c[0]?.v || '',
            name: row.c[1]?.v || '',
            username: row.c[2]?.v || '',
            outstanding: row.c[3]?.v || '',
            totalOutstanding: row.c[5]?.v || '',
            password: row.c[6]?.v || ''
          };
          return user;
        }).filter(user => user.username && user.password);
        
        setDebugInfo(prev => prev + `\nProcessed ${users.length} users`);
        
        setAllUsers(users);
        setLoading(false);
        setError('');
      } catch (error) {
        console.error('Fetch error:', error);
        setDebugInfo(prev => prev + `\nError: ${error.message}`);
        setError(`Error loading data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      setUserData(user);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-lg mb-4">Loading user data...</div>
        <div className="text-sm text-gray-600 whitespace-pre-wrap">
          {debugInfo}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">User Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            {debugInfo && (
              <div className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
                {debugInfo}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{userData.name}</p>
              </div>
              <div>
                <p className="font-semibold">Flat No:</p>
                <p>{userData.flatNo}</p>
              </div>
              <div>
                <p className="font-semibold">Outstanding:</p>
                <p>₹{userData.outstanding}</p>
              </div>
              <div>
                <p className="font-semibold">Total Outstanding:</p>
                <p>₹{userData.totalOutstanding}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <a 
                href="https://call.whatsapp.com/voice/LRzVgDOCq7WXWvoKDr7Wsq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Contact
                </Button>
              </a>
              <Button 
                className="w-full"
                onClick={() => window.open('/qr-code.png', '_blank')}
              >
                Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishedSheetDashboard;
