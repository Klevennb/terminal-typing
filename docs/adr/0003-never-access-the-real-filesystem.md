# Never access the learner's real filesystem

All file and directory interactions will occur in isolated virtual workspaces defined by challenge scenarios. The app will not request, mount, import from, read, or write to the learner's real filesystem; this preserves the safety and trust expected of a simulated practice environment, even if browser filesystem APIs could make real access technically possible.
