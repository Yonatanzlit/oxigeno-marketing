<?php
/* Bagó game statistics: counts only, no personal data.
   g=memotest (default) | gondola picks the game; each game has its own file.
   POST e=visit|start|finish adds one count. On finish:
     memotest: t=seconds, a=attempts · gondola: t=score, a=level reached.
   GET ?g=... returns totals + the last 30 days as JSON for the portal's Juegos tab. */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
date_default_timezone_set('America/Argentina/Buenos_Aires');
$games = array(
  'memotest' => array('t' => array(1, 3600), 'a' => array(8, 999)),
  'gondola' => array('t' => array(0, 100000), 'a' => array(1, 99))
);
$g = isset($_REQUEST['g']) ? $_REQUEST['g'] : 'memotest';
if (!isset($games[$g])) { http_response_code(400); echo '{"ok":false}'; exit; }
$lim = $games[$g];
$file = __DIR__ . '/data/' . $g . '-stats.json';

function read_all($fp) {
  rewind($fp);
  $raw = stream_get_contents($fp);
  $d = json_decode($raw ? $raw : '', true);
  if (!is_array($d) || !isset($d['days']) || !is_array($d['days'])) $d = array('days' => array());
  return $d;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $map = array('visit' => 'v', 'start' => 's', 'finish' => 'f');
  $e = isset($_POST['e']) ? $_POST['e'] : '';
  if (!isset($map[$e])) { http_response_code(400); echo '{"ok":false}'; exit; }
  $fp = @fopen($file, 'c+');
  if (!$fp) { http_response_code(500); echo '{"ok":false,"error":"store"}'; exit; }
  flock($fp, LOCK_EX);
  $d = read_all($fp);
  $day = date('Y-m-d');
  if (!isset($d['days'][$day])) $d['days'][$day] = array('v' => 0, 's' => 0, 'f' => 0, 't' => 0, 'a' => 0);
  $d['days'][$day][$map[$e]]++;
  if ($e === 'finish') {
    $t = isset($_POST['t']) ? (int)$_POST['t'] : 0;
    $a = isset($_POST['a']) ? (int)$_POST['a'] : 0;
    $d['days'][$day]['t'] += max($lim['t'][0], min($lim['t'][1], $t));
    $d['days'][$day]['a'] += max($lim['a'][0], min($lim['a'][1], $a));
  }
  ftruncate($fp, 0); rewind($fp);
  fwrite($fp, json_encode($d));
  fflush($fp); flock($fp, LOCK_UN); fclose($fp);
  echo '{"ok":true}';
  exit;
}

$d = array('days' => array());
if (file_exists($file) && ($fp = @fopen($file, 'r'))) { flock($fp, LOCK_SH); $d = read_all($fp); flock($fp, LOCK_UN); fclose($fp); }
$tot = array('visits' => 0, 'starts' => 0, 'finishes' => 0, 'time' => 0, 'tries' => 0);
foreach ($d['days'] as $row) {
  $tot['visits'] += $row['v']; $tot['starts'] += $row['s']; $tot['finishes'] += $row['f'];
  $tot['time'] += $row['t']; $tot['tries'] += $row['a'];
}
$days = array();
for ($i = 29; $i >= 0; $i--) {
  $k = date('Y-m-d', strtotime("-$i days"));
  $r = isset($d['days'][$k]) ? $d['days'][$k] : array('v' => 0, 's' => 0, 'f' => 0);
  $days[] = array('d' => $k, 'visits' => $r['v'], 'starts' => $r['s'], 'finishes' => $r['f']);
}
echo json_encode(array(
  'visits' => $tot['visits'], 'starts' => $tot['starts'], 'finishes' => $tot['finishes'],
  'avg_time' => $tot['finishes'] ? round($tot['time'] / $tot['finishes']) : null,
  'avg_tries' => $tot['finishes'] ? round($tot['tries'] / $tot['finishes'], 1) : null,
  'game' => $g, 'days' => $days, 'now' => date('c')
));
