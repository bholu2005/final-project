<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Security Scan Report - {{ $scan->scan_reference }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.5;
        }
        .header {
            border-bottom: 3px solid #E8D5C6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header-title {
            font-size: 28px;
            font-weight: bold;
            color: #111111;
            margin: 0;
        }
        .header-subtitle {
            font-size: 14px;
            color: #666666;
            margin: 5px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .meta-table td {
            padding: 8px 12px;
            border: 1px solid #eeeeee;
        }
        .meta-label {
            font-weight: bold;
            color: #555555;
            width: 30%;
            background-color: #fafafa;
        }
        .score-box {
            text-align: center;
            padding: 20px;
            background-color: #FDFBF7;
            border: 2px solid #E8D5C6;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .score-value {
            font-size: 48px;
            font-weight: bold;
            color: #111111;
            margin: 0;
        }
        .score-label {
            font-size: 12px;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 5px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #111111;
            border-bottom: 2px solid #333333;
            padding-bottom: 5px;
            margin-top: 40px;
            margin-bottom: 20px;
        }
        .issue-card {
            border: 1px solid #dddddd;
            border-radius: 6px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .issue-header {
            background-color: #f5f5f5;
            padding: 10px 15px;
            font-weight: bold;
            border-bottom: 1px solid #dddddd;
        }
        .severity-badge {
            float: right;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            text-transform: uppercase;
            color: #ffffff;
            font-weight: bold;
        }
        .severity-critical {
            background-color: #dc3545;
        }
        .severity-high {
            background-color: #fd7e14;
        }
        .severity-medium {
            background-color: #ffc107;
            color: #212529;
        }
        .severity-low {
            background-color: #17a2b8;
        }
        .issue-body {
            padding: 15px;
        }
        .issue-meta {
            font-size: 12px;
            color: #666666;
            margin-bottom: 10px;
        }
        .code-block {
            background-color: #27272a;
            color: #f4f4f5;
            padding: 10px 15px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin-top: 10px;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 50px;
            border-top: 1px solid #eeeeee;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #999999;
        }
    </style>
</head>
<body>

    <div class="header">
        <table style="width: 100%; border: none;">
            <tr style="border: none;">
                <td style="border: none; padding: 0;">
                    <div class="header-title">MERLIN SECURITY</div>
                    <div class="header-subtitle">Automated Code Vulnerability Assessment</div>
                </td>
                <td style="border: none; padding: 0; text-align: right; vertical-align: bottom;">
                    <span style="font-size: 12px; color: #888888;">Generated on {{ $date }}</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="score-box">
        <div class="score-value">{{ $scan->score }} / 100</div>
        <div class="score-label">Security Health Score</div>
    </div>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Scan Reference</td>
            <td>{{ $scan->scan_reference }}</td>
        </tr>
        <tr>
            <td class="meta-label">Target Type</td>
            <td style="text-transform: uppercase;">{{ $scan->target_type }}</td>
        </tr>
        <tr>
            <td class="meta-label">Target Value</td>
            <td style="font-family: monospace; font-size: 12px;">{{ $scan->target_value }}</td>
        </tr>
        <tr>
            <td class="meta-label">Total Findings</td>
            <td>{{ count($issues) }} issues detected</td>
        </tr>
    </table>

    <div class="section-title">Vulnerability & Findings Report</div>

    @if(count($issues) === 0)
        <p style="color: #28a745; font-weight: bold; text-align: center; padding: 30px; background-color: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 6px;">
            ✓ Great job! No security vulnerabilities or critical code issues detected in this scan.
        </p>
    @else
        @foreach($issues as $issue)
            <div class="issue-card">
                <div class="issue-header">
                    <span class="severity-badge
                        @if(strtolower($issue['severity'] ?? '') === 'critical') severity-critical
                        @elseif(strtolower($issue['severity'] ?? '') === 'high') severity-high
                        @elseif(strtolower($issue['severity'] ?? '') === 'medium') severity-medium
                        @else severity-low
                        @endif">
                        {{ $issue['severity'] ?? 'Low' }}
                    </span>
                    {{ $issue['name'] ?? 'Vulnerability Detected' }}
                </div>
                <div class="issue-body">
                    <div class="issue-meta">
                        <strong>Category:</strong> {{ $issue['type'] ?? 'N/A' }} &nbsp;|&nbsp;
                        <strong>Location:</strong> <span style="font-family: monospace;">{{ $issue['location'] ?? 'N/A' }}@if(isset($issue['line'])):{{ $issue['line'] }}@endif</span>
                    </div>
                    <p style="margin: 10px 0;"><strong>Description:</strong> {{ $issue['description'] ?? '' }}</p>

                    @if(!empty($issue['snippet']))
                        <p style="margin: 10px 0 5px 0; font-size: 12px; color: #555555;"><strong>Detected Code:</strong></p>
                        <div class="code-block">{{ $issue['snippet'] }}</div>
                    @endif

                    @if(!empty($issue['fix_suggestion']))
                        <p style="margin: 15px 0 5px 0; font-size: 12px; color: #555555;"><strong>Remediation / Fix Suggestion:</strong></p>
                        <div class="code-block" style="background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">{{ $issue['fix_suggestion'] }}</div>
                    @endif
                </div>
            </div>
        @endforeach
    @endif

    <div class="footer">
        Merlin Automated Security Audit System. Confidentially generated for users of the platform.
    </div>

</body>
</html>
