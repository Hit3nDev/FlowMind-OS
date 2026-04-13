package com.flowmind.service;
import com.flowmind.model.Session;
import com.flowmind.model.User;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashMap;

@Service
public class UserService {
    private final Map<String,User>    users    = new ConcurrentHashMap<>();
    private final Map<String,Session> sessions = new ConcurrentHashMap<>();

    public UserService() {
        register("harshit","pass123","Harshit","harshit@flowmind.ai");
        register("student","student","Student","student@flowmind.ai");
        register("demo","demo","Demo User","demo@flowmind.ai");
        register("tejas","tejas123","Tejas Kashyap","tejas@flowmind.ai");
    }

    public String register(String u, String p, String d, String e) {
        if(u==null||u.length()<3) return "Username must be at least 3 characters.";
        if(p==null||p.length()<4) return "Password must be at least 4 characters.";
        if(users.containsKey(u.toLowerCase())) return "Username already exists.";
        users.put(u.toLowerCase(), new User(u.toLowerCase(),p,d,e));
        return null;
    }

    public String login(String u, String p) {
        User user=users.get(u.toLowerCase());
        if(user==null||!user.getPassword().equals(p)) return null;
        String token=UUID.randomUUID().toString();
        sessions.put(token, new Session(token,u.toLowerCase()));
        return token;
    }

    public void logout(String token)             { sessions.remove(token); }
    public Session getSession(String token)      { Session s=sessions.get(token); if(s!=null)s.touch(); return s; }
    public User    getUser(String token)         { Session s=getSession(token); return s==null?null:users.get(s.getUsername()); }
    public String  getUsernameByToken(String t)  { Session s=getSession(t); return s==null?null:s.getUsername(); }
    public boolean isValidToken(String t)        { return t!=null&&sessions.containsKey(t); }
    public void    setTracking(String t, boolean b){ User u=getUser(t); if(u!=null)u.setTrackingEnabled(b); }
    public boolean isTrackingEnabled(String t)   { User u=getUser(t); return u!=null&&u.isTrackingEnabled(); }

    public Map<String, User> getAllUsers() { return new HashMap<>(users); }
    public Map<String, Session> getAllSessions() { return new HashMap<>(sessions); }
    public void clearAll() { users.clear(); sessions.clear(); }
}
