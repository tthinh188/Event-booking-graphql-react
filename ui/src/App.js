import './App.css';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import Auth from './components/Auth/Auth';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Redirect from="/" to="/auth" exact/>
        <Route path="/auth" component={Auth} />
        <Route path="/events" component={ } />
        <Route path="/bookings" component={ } />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
