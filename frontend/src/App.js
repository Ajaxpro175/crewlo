import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Leads from './components/Leads';
import Estimates from './components/Estimates';
import Materials from './components/Materials';
import Proposals from './components/Proposals';
import Invoices from './components/Invoices';
import MobileNavigation from './components/MobileNavigation';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/invoices" element={<Invoices />} />
          </Routes>
          <MobileNavigation />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;