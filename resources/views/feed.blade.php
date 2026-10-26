<rss version="2.0"><channel><title>{{ $site['name'] }}</title><link>{{ url('/') }}</link><description>{{ $site['description'] }}</description><language>en</language>
@foreach ($entries as $entry)
<item><title>{{ $entry->title }}</title><link>{{ url($entry->public_path) }}</link><guid>{{ url($entry->public_path) }}</guid><pubDate>{{ $entry->published_at->toRfc2822String() }}</pubDate><description>{{ $entry->html }}</description></item>
@endforeach
</channel></rss>
